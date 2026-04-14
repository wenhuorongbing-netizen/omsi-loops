/**
 * @param {import("playwright").Page} page
 */
export async function captureRuntimeMetrics(page) {
    return page.evaluate(() => {
        const session = globalThis.IdleLoopsBootstrap?.getGameSession?.() ?? null;
        const sessionState = session?.captureState?.() ?? null;
        /** @param {number} value */
        const round = value => Number(value.toFixed(6));
        /** @param {string[]} names @param {(name: string) => any} projector */
        const mapNames = (names, projector) => Object.fromEntries([...names].sort((left, right) => left.localeCompare(right)).map(name => [name, projector(name)]));
        /** @param {Record<string, boolean>} flags */
        const enabledFlags = flags => Object.keys(flags).filter(name => flags[name]).sort((left, right) => left.localeCompare(right));
        /** @param {Record<string, number>} values */
        const nonZeroValues = values => Object.fromEntries(Object.entries(values)
            .filter(([, value]) => value)
            .sort(([left], [right]) => left.localeCompare(right)));

        return {
            session: {
                available: !!sessionState,
                scalars: sessionState?.scalars ?? null,
            },
            meta: sessionState?.meta ?? null,
            resources: sessionState?.resources ?? null,
            prestige: sessionState?.prestige ?? null,
            totals: sessionState?.totals ?? null,
            challengeSave: sessionState?.challengeSave ?? null,
            townsUnlocked: sessionState?.townsUnlocked ?? null,
            queue: sessionState?.queue ?? null,
            stats: mapNames(statList, statName => ({
                level: stats[statName].statLevelExp.level,
                totalExp: stats[statName].statLevelExp.totalExp,
                talentLevel: stats[statName].talentLevelExp.level,
                talentTotalExp: stats[statName].talentLevelExp.totalExp,
                soulstone: stats[statName].soulstone,
            })),
            skills: mapNames(skillList, skillName => ({
                level: skills[skillName].levelExp.level,
                totalExp: skills[skillName].levelExp.totalExp,
            })),
            buffs: mapNames(buffList, buffName => ({
                amount: buffs[buffName].amt,
                cap: buffCaps[buffName] ?? null,
            })),
            story: {
                storyMax,
                unreadActionStories: [...unreadActionStories].sort((left, right) => left.localeCompare(right)),
                trueFlags: enabledFlags(storyFlags),
                vars: nonZeroValues(storyVars),
            },
            completedActions: nonZeroValues(completedActions),
            towns: towns.map(town => ({
                index: town.index,
                unlocked: town.unlocked(),
                hiddenVars: [...town.hiddenVars].sort((left, right) => left.localeCompare(right)),
                progress: mapNames(town.progressVars.filter(varName => town[`exp${varName}`] !== 0), varName => ({
                    level: town.getLevel(varName),
                    exp: town[`exp${varName}`],
                })),
                limited: mapNames(town.varNames.filter(varName =>
                    town[`total${varName}`] !== 0
                    || town[`checked${varName}`] !== 0
                    || town[`good${varName}`] !== 0
                    || town[`goodTemp${varName}`] !== 0
                    || town[`lootFrom${varName}`] !== 0
                ), varName => ({
                    total: town[`total${varName}`],
                    checked: town[`checked${varName}`],
                    good: town[`good${varName}`],
                    goodTemp: town[`goodTemp${varName}`],
                    loot: town[`lootFrom${varName}`],
                })),
                multipart: mapNames(town.multipartVars.filter(varName =>
                    town[varName] !== 0
                    || town[`${varName}LoopCounter`] !== 0
                    || (town[`total${varName}`] ?? 0) !== 0
                ), varName => ({
                    progress: town[varName],
                    loopCounter: town[`${varName}LoopCounter`],
                    total: town[`total${varName}`] ?? 0,
                })),
            })),
            dungeons: dungeons.map((dungeon, index) => ({
                index,
                completionSum: dungeon.reduce((total, floor) => total + floor.completed, 0),
                highestCompletedFloor: dungeon.reduce((highest, floor, floorIndex) => floor.completed > 0 ? floorIndex + 1 : highest, 0),
                floors: dungeon.map((floor, floorIndex) => ({
                    floor: floorIndex + 1,
                    completed: floor.completed,
                    ssChance: round(floor.ssChance),
                })),
            })),
            trials: trials.map((trial, index) => ({
                index,
                highestFloor: trial.highestFloor ?? 0,
                completionSum: trial.reduce((total, floor) => total + floor.completed, 0),
                floors: trial.map((floor, floorIndex) => ({
                    floor: floorIndex + 1,
                    completed: floor.completed,
                })),
            })),
        };
    });
}
