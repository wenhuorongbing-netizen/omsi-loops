"use strict";

(function setupAppContext(global) {
    function resolveBinding(name, getter) {
        const legacy = global.IdleLoopsLegacy;
        if (!legacy || typeof legacy.resolveBinding !== "function") {
            throw new Error("[app-context] IdleLoopsLegacy.resolveBinding is not available");
        }
        return legacy.resolveBinding(name, getter);
    }

    function createBindingAccessor(name, getter, setter) {
        const legacy = global.IdleLoopsLegacy;
        if (!legacy || typeof legacy.createBindingAccessor !== "function") {
            throw new Error("[app-context] IdleLoopsLegacy.createBindingAccessor is not available");
        }
        return legacy.createBindingAccessor(name, getter, setter);
    }

    function sortObjectEntries(source) {
        return Object.fromEntries(Object.entries(source).sort(([left], [right]) => left.localeCompare(right)));
    }

    function captureBindingState(bindings, names = Object.keys(bindings)) {
        return Object.fromEntries(names.map(name => {
            if (!(name in bindings)) {
                throw new Error(`[app-context] Unknown binding: ${name}`);
            }
            return [name, bindings[name].get()];
        }));
    }

    function applyBindingState(bindings, patch) {
        for (const [name, value] of Object.entries(patch)) {
            if (!(name in bindings)) {
                throw new Error(`[app-context] Unknown binding: ${name}`);
            }
            bindings[name].set(value);
        }
        return captureBindingState(bindings, Object.keys(patch));
    }

    class LegacyAppContext {
        constructor() {
            const scalarBindings = {
                timer: createBindingAccessor("timer", () => timer, value => { timer = value; }),
                timeNeeded: createBindingAccessor("timeNeeded", () => timeNeeded, value => { timeNeeded = value; }),
                curTown: createBindingAccessor("curTown", () => curTown, value => { curTown = value; }),
                totalTalent: createBindingAccessor("totalTalent", () => totalTalent, value => { totalTalent = value; }),
                shouldRestart: createBindingAccessor("shouldRestart", () => shouldRestart, value => { shouldRestart = value; }),
                guild: createBindingAccessor("guild", () => guild, value => { guild = value; }),
                storyMax: createBindingAccessor("storyMax", () => storyMax, value => { storyMax = value; }),
                totalMerchantMana: createBindingAccessor("totalMerchantMana", () => totalMerchantMana, value => { totalMerchantMana = value; }),
                goldInvested: createBindingAccessor("goldInvested", () => goldInvested, value => { goldInvested = value; }),
                stonesUsed: createBindingAccessor("stonesUsed", () => stonesUsed, value => { stonesUsed = value; }),
                gameIsStopped: createBindingAccessor("gameIsStopped", () => gameIsStopped, value => { gameIsStopped = value; }),
            };
            this.scalarBindings = Object.freeze(scalarBindings);
            this.globalBindings = Object.freeze({
                ...scalarBindings,
                escapeStarted: createBindingAccessor("escapeStarted", () => escapeStarted, value => { escapeStarted = value; }),
                portalUsed: createBindingAccessor("portalUsed", () => portalUsed, value => { portalUsed = value; }),
                stoneLoc: createBindingAccessor("stoneLoc", () => stoneLoc, value => { stoneLoc = value; }),
                trainingLimits: createBindingAccessor("trainingLimits", () => trainingLimits, value => { trainingLimits = value; }),
                unreadActionStories: createBindingAccessor("unreadActionStories", () => unreadActionStories, value => { unreadActionStories = value; }),
                curAdvGuildSegment: createBindingAccessor("curAdvGuildSegment", () => curAdvGuildSegment, value => { curAdvGuildSegment = value; }),
                curCraftGuildSegment: createBindingAccessor("curCraftGuildSegment", () => curCraftGuildSegment, value => { curCraftGuildSegment = value; }),
                curWizCollegeSegment: createBindingAccessor("curWizCollegeSegment", () => curWizCollegeSegment, value => { curWizCollegeSegment = value; }),
                curFightFrostGiantsSegment: createBindingAccessor("curFightFrostGiantsSegment", () => curFightFrostGiantsSegment, value => { curFightFrostGiantsSegment = value; }),
                curFightJungleMonstersSegment: createBindingAccessor("curFightJungleMonstersSegment", () => curFightJungleMonstersSegment, value => { curFightJungleMonstersSegment = value; }),
                curThievesGuildSegment: createBindingAccessor("curThievesGuildSegment", () => curThievesGuildSegment, value => { curThievesGuildSegment = value; }),
                curGodsSegment: createBindingAccessor("curGodsSegment", () => curGodsSegment, value => { curGodsSegment = value; }),
                dungeons: createBindingAccessor("dungeons", () => dungeons, value => { dungeons = value; }),
                trials: createBindingAccessor("trials", () => trials, value => { trials = value; }),
            });
        }

        get actions() { return resolveBinding("actions", () => actions); }
        get towns() { return resolveBinding("towns", () => towns); }
        get resources() { return resolveBinding("resources", () => resources); }
        get stats() { return resolveBinding("stats", () => stats); }
        get skills() { return resolveBinding("skills", () => skills); }
        get buffs() { return resolveBinding("buffs", () => buffs); }
        get options() { return resolveBinding("options", () => options); }
        get view() { return resolveBinding("view", () => view); }
        get localization() { return resolveBinding("Localization", () => Localization); }
        get predictor() { return resolveBinding("Koviko", () => Koviko); }
        get townsUnlocked() { return resolveBinding("townsUnlocked", () => townsUnlocked); }
        get storyFlags() { return resolveBinding("storyFlags", () => storyFlags); }
        get storyVars() { return resolveBinding("storyVars", () => storyVars); }
        get prestigeValues() { return resolveBinding("prestigeValues", () => prestigeValues); }
        get totals() { return resolveBinding("totals", () => totals); }
        get challengeSave() { return resolveBinding("challengeSave", () => challengeSave); }
        get totalActionList() { return resolveBinding("totalActionList", () => totalActionList); }

        captureScalarState() {
            return captureBindingState(this.scalarBindings);
        }

        captureGlobalState(names = Object.keys(this.globalBindings)) {
            return captureBindingState(this.globalBindings, names);
        }

        captureSaveState() {
            return this.captureGlobalState([
                "totalTalent",
                "goldInvested",
                "stonesUsed",
                "storyMax",
                "unreadActionStories",
            ]);
        }

        captureCollections() {
            return {
                townsUnlocked: [...this.townsUnlocked],
                resources: sortObjectEntries(this.resources),
                options: sortObjectEntries(this.options),
            };
        }

        captureQueueState() {
            return this.actions.next.map(action => ({
                name: action.name,
                loops: action.loops,
                disabled: !!action.disabled,
                loopsType: action.loopsType,
            }));
        }

        captureSessionState() {
            const scalars = this.captureScalarState();
            return {
                meta: {
                    curTown: scalars.curTown,
                    timer: scalars.timer,
                    timeNeeded: scalars.timeNeeded,
                    gameIsStopped: scalars.gameIsStopped,
                    totalActionCount: this.totalActionList.length,
                    townCount: this.towns.length,
                },
                scalars,
                resources: sortObjectEntries(this.resources),
                prestige: sortObjectEntries(this.prestigeValues),
                totals: sortObjectEntries(this.totals),
                challengeSave: sortObjectEntries(this.challengeSave),
                townsUnlocked: [...this.townsUnlocked],
                queue: this.captureQueueState(),
            };
        }

        applyScalarState(patch) {
            return applyBindingState(this.scalarBindings, patch);
        }

        applyGlobalState(patch) {
            return applyBindingState(this.globalBindings, patch);
        }
    }

    /** @type {LegacyAppContext | null} */
    let defaultLegacyAppContext = null;

    global.IdleLoopsAppContext = Object.freeze({
        LegacyAppContext,
        createLegacyAppContext() {
            return new LegacyAppContext();
        },
        getLegacyAppContext() {
            return defaultLegacyAppContext ??= new LegacyAppContext();
        },
    });
})(globalThis);
