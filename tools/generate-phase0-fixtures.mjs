import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startStaticServer } from "./static-server-lib.mjs";
import { dismissTutorialIfPresent, openFixturePage } from "../tests/support/runtime-fixture-driver.mjs";
import { readFixtureManifest } from "../tests/support/fixture-manifest.mjs";
import { phase0FixturePresets } from "../tests/fixtures/saves/phase0-presets.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = readFixtureManifest();
const presetsById = new Map(phase0FixturePresets.map(preset => [preset.id, preset]));
const newGameFixture = manifest.find(fixture => fixture.id === "new-game");

if (!newGameFixture) {
    throw new Error("Missing required fixture: new-game");
}

const targetFixtures = manifest.filter(fixture => presetsById.has(fixture.id));
if (targetFixtures.length === 0) {
    throw new Error("No Phase 0 fixtures found in manifest.");
}

const server = await startStaticServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
});

const browser = await chromium.launch({headless: true});

function buildFixturePayload(fixtureId, description, saveJson) {
    const parsed = JSON.parse(saveJson);
    const challengeSave = parsed.challengeSave ?? {};
    const shouldPopulateChallengeSlot = challengeSave.inChallenge === true || challengeSave.challengeMode > 0;
    return {
        name: fixtureId,
        description,
        localStorage: {
            idleLoops1: saveJson,
            idleLoopsChallenge: shouldPopulateChallengeSlot ? saveJson : "",
        },
    };
}

try {
    for (const fixture of targetFixtures) {
        const preset = presetsById.get(fixture.id);
        const runtime = await openFixturePage({
            browser,
            baseUrl: server.url,
            fixturePath: newGameFixture.fixturePath,
            language: fixture.language ?? "en-EN",
        });
        try {
            await dismissTutorialIfPresent(runtime.page);
            if (runtime.consoleErrors.length > 0) {
                throw new Error(`Refusing to generate ${fixture.id}; page reported ${runtime.consoleErrors.length} console/page errors.`);
            }

            const generated = await runtime.page.evaluate((scenario) => {
                const session = globalThis.IdleLoopsBootstrap?.getGameSession?.();
                if (!session) {
                    throw new Error("GameSession is not available.");
                }

                /** @param {string} name */
                const requireAction = name => {
                    const action = getActionPrototype(name);
                    if (!action) {
                        throw new Error(`Unknown action: ${name}`);
                    }
                    return action;
                };

                const setStatState = (statName, value) => {
                    if (!value) return;
                    if (typeof value.level === "number") {
                        stats[statName].statLevelExp.setLevel(value.level);
                    }
                    if (typeof value.talent === "number") {
                        stats[statName].talentLevelExp.setLevel(value.talent);
                    }
                    if (typeof value.soulstone === "number") {
                        stats[statName].soulstone = value.soulstone;
                    }
                };

                const setSkillState = (skillName, level) => {
                    if (typeof level === "number") {
                        skills[skillName].levelExp.setLevel(level);
                    }
                };

                const setTownActionState = entry => {
                    const action = requireAction(entry.name);
                    const town = towns[action.townNum];
                    if (action.type === "progress") {
                        town[`exp${action.varName}`] = entry.exp ?? 0;
                        return;
                    }
                    if (action.type === "limited") {
                        town[`total${action.varName}`] = entry.total ?? 0;
                        town[`checked${action.varName}`] = entry.checked ?? 0;
                        town[`good${action.varName}`] = entry.good ?? 0;
                        town[`goodTemp${action.varName}`] = entry.goodTemp ?? entry.good ?? 0;
                        town[`lootFrom${action.varName}`] = entry.loot ?? 0;
                        return;
                    }
                    if (action.type === "multipart") {
                        town[action.varName] = entry.progress ?? 0;
                        town[`${action.varName}LoopCounter`] = entry.loopCounter ?? 0;
                        town[`total${action.varName}`] = entry.total ?? 0;
                    }
                };

                const createDungeonState = source => dungeons.map((dungeon, dungeonIndex) => {
                    const preset = source?.[dungeonIndex];
                    return dungeon.map((floor, floorIndex) => ({
                        ssChance: preset?.floors?.[floorIndex]?.ssChance ?? floor.ssChance ?? 1,
                        completed: preset?.floors?.[floorIndex]?.completed ?? floor.completed ?? 0,
                        lastStat: "NA",
                    }));
                });

                const createTrialState = source => trials.map((trial, trialIndex) => {
                    const preset = source?.[trialIndex];
                    const nextTrial = trial.map((floor, floorIndex) => ({
                        completed: preset?.completed?.[floorIndex] ?? floor.completed ?? 0,
                    }));
                    nextTrial.highestFloor = nextTrial.reduce((highest, floor, floorIndex) => floor.completed > 0 ? floorIndex : highest, 0);
                    return nextTrial;
                });

                const defaultCollections = session.captureCollectionState([
                    "storyFlags",
                    "storyVars",
                    "totals",
                    "prestigeValues",
                ]);
                const defaultGlobals = session.captureGlobalState([
                    "goldInvested",
                    "stonesUsed",
                    "storyMax",
                    "totalMerchantMana",
                    "guild",
                    "unreadActionStories",
                    "curAdvGuildSegment",
                    "curCraftGuildSegment",
                    "curWizCollegeSegment",
                    "curFightFrostGiantsSegment",
                    "curFightJungleMonstersSegment",
                    "curThievesGuildSegment",
                    "curGodsSegment",
                ]);

                actions.clearActions();
                actions.current = [];

                const completedActions = [...new Set(["FoundGlasses", ...(scenario.completedActions ?? [])])];
                const nextGlobals = {
                    ...defaultGlobals,
                    ...(scenario.globals ?? {}),
                    unreadActionStories: scenario.unreadActionStories ?? [],
                };

                for (const [resource, value] of Object.entries(scenario.resources ?? {})) {
                    resources[resource] = value;
                }

                for (const [buffName, amount] of Object.entries(scenario.buffs ?? {})) {
                    buffs[buffName].amt = amount;
                }

                for (const [statName, value] of Object.entries(scenario.stats ?? {})) {
                    setStatState(statName, value);
                }
                for (const [skillName, level] of Object.entries(scenario.skills ?? {})) {
                    setSkillState(skillName, level);
                }

                const computedTotalTalent = Object.values(stats).reduce((total, stat) => total + stat.talentLevelExp.totalExp * 100, 0);

                session.applyGlobalPatch({
                    totalTalent: scenario.totalTalent ?? computedTotalTalent,
                    ...nextGlobals,
                    dungeons: createDungeonState(scenario.dungeons),
                    trials: createTrialState(scenario.trials),
                });

                session.applyCollectionPatch({
                    townsUnlocked: scenario.unlockedTowns ?? [0],
                    completedActions,
                    challengeSave: {
                        challengeMode: 0,
                        inChallenge: false,
                        ...(scenario.challengeSave ?? {}),
                    },
                    storyFlags: {
                        ...defaultCollections.storyFlags,
                        ...(scenario.storyFlags ?? {}),
                    },
                    storyVars: {
                        ...defaultCollections.storyVars,
                        ...(scenario.storyVars ?? {}),
                    },
                    totals: {
                        ...defaultCollections.totals,
                        ...(scenario.totals ?? {}),
                    },
                    prestigeValues: {
                        ...defaultCollections.prestigeValues,
                        ...(scenario.prestigeValues ?? {}),
                    },
                });

                for (const entry of scenario.townActions ?? []) {
                    setTownActionState(entry);
                }

                for (const entry of scenario.queue ?? []) {
                    actions.addActionRecord({
                        name: entry.name,
                        loops: entry.loops,
                        disabled: !!entry.disabled,
                        loopsType: entry.loopsType,
                    }, -1, false);
                }

                const targetTown = scenario.targetTown ?? 0;
                session.applyScalarPatch({
                    curTown: targetTown,
                });
                view.showTown(targetTown);
                adjustAll();
                view.updateStats();
                view.updateSkills();
                view.updateBuffs();
                view.updateTotals();
                view.updatePrestigeValues();
                view.updateNextActions();
                view.updateStories(true);
                view.update();
                pauseGame();

                const saveJson = save();
                return {
                    saveJson,
                    summary: {
                        targetTown,
                        townsUnlocked: session.captureCollectionState(["townsUnlocked"]).townsUnlocked,
                        queueLength: actions.next.length,
                        totalTalent: session.captureState().scalars.totalTalent,
                        totals: session.captureCollectionState(["totals"]).totals,
                    },
                };
            }, preset);

            const payload = buildFixturePayload(fixture.id, preset.description, generated.saveJson);
            fs.writeFileSync(fixture.fixturePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
            console.log(`Generated fixture: ${path.relative(rootDir, fixture.fixturePath)} ${JSON.stringify(generated.summary)}`);
        } finally {
            await runtime.context.close();
        }
    }
} finally {
    await browser.close();
    await server.close();
}
