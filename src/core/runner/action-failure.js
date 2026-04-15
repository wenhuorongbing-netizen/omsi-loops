"use strict";

(function setupRunnerFailure(global) {
    function getGoldFailureThreshold(action, {towns}) {
        if (typeof action.goldCost === "function") {
            const cost = action.goldCost();
            if (Number.isFinite(cost)) return cost;
        }
        switch (action.name) {
            case "Buy Glasses":
            case "Guided Tour":
                return 10;
            case "Donate":
                return 20;
            case "Buy Pickaxe":
                return 200;
            case "Buy Supplies":
                return towns[0].suppliesCost;
            case "Purchase Supplies":
            case "Wizard College":
                return 500;
            case "Pegasus":
                return 200;
            case "Invest":
                return 1;
        }
        return undefined;
    }

    function getResourceFailureInfo(action, dependencies) {
        const {createActionFailureInfo, resources} = dependencies;
        const goldThreshold = getGoldFailureThreshold(action, dependencies);
        if (Number.isFinite(goldThreshold) && resources.gold < goldThreshold) {
            return createActionFailureInfo("cost", "goldLow");
        }

        switch (action.name) {
            case "Wizard College":
                if (resources.favors < 10) return createActionFailureInfo("cost", "favorsLow");
                break;
            case "Pegasus":
                if (resources.favors < 20) return createActionFailureInfo("cost", "favorsLow");
                break;
        }

        return null;
    }

    function getStartFailureInfo(action, dependencies) {
        const {
            createActionFailureInfo,
            resources,
            guild,
            towns,
            dungeons,
            trialFloors,
            TrialAction,
            DungeonAction,
        } = dependencies;

        switch (action.name) {
            case "Heal The Sick":
                return createActionFailureInfo("condition", "reputationLow");
            case "Brew Potions":
                if (resources.reputation < 5) return createActionFailureInfo("condition", "reputationLow");
                if (resources.herbs < 10) return createActionFailureInfo("cost", "herbsLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Gamble":
                if (resources.reputation < -5) return createActionFailureInfo("condition", "reputationLow");
                if (resources.gold < 20) return createActionFailureInfo("cost", "goldLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Gather Team":
                if (guild !== "Adventure") return createActionFailureInfo("condition", "adventureGuildRequired");
                if (resources.gold < (resources.teamMembers + 1) * 100) return createActionFailureInfo("cost", "goldLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Craft Armor":
                return createActionFailureInfo("cost", "hideLow");
            case "Imbue Body":
                return createActionFailureInfo("condition", "imbueBodyRequirement");
            case "Accept Donations":
                return createActionFailureInfo("condition", "positiveReputationRequired");
            case "Raise Zombie":
                return createActionFailureInfo("cost", "bloodLow");
            case "Journey Forth":
                return createActionFailureInfo("cost", "suppliesLow");
            case "Escape":
                return createActionFailureInfo("timing", "escapeWindow");
            case "Open Portal":
                return createActionFailureInfo("condition", "restorationLow");
            case "Gods Trial":
                if (action.currentFloor() >= trialFloors[action.trialNum]) return createActionFailureInfo("exhausted", "completed", "soft");
                if (resources.power >= 7) return createActionFailureInfo("exhausted", "powerCapped", "soft");
                return createActionFailureInfo("condition", "genericCondition");
            case "Challenge Gods":
                if (action.currentFloor() >= trialFloors[action.trialNum]) return createActionFailureInfo("exhausted", "completed", "soft");
                if (resources.power >= 8) return createActionFailureInfo("exhausted", "powerCapped", "soft");
                if (resources.power <= 0) return createActionFailureInfo("condition", "powerRequired");
                return createActionFailureInfo("condition", "genericCondition");
        }

        if (action instanceof TrialAction) {
            if (action.currentFloor() >= trialFloors[action.trialNum]) {
                return createActionFailureInfo("exhausted", "completed", "soft");
            }
            return createActionFailureInfo("condition", "genericCondition");
        }

        if (action instanceof DungeonAction) {
            const loopCounter = towns[action.townNum][`${action.varName}LoopCounter`];
            const currentFloor = Math.floor(loopCounter / action.segments + 0.0000001);
            if (currentFloor >= dungeons[action.dungeonNum].length) {
                return createActionFailureInfo("exhausted", "completed", "soft");
            }
            return createActionFailureInfo("condition", "genericCondition");
        }

        return getResourceFailureInfo(action, dependencies) ?? createActionFailureInfo("condition", "genericCondition");
    }

    function getProgressFailureInfo(action, {createActionFailureInfo}) {
        switch (action.name) {
            case "Dead Trial":
                return createActionFailureInfo("model", "zombieModel");
            case "Challenge Gods":
                return createActionFailureInfo("model", "selfModel");
            case "Small Dungeon":
            case "Fight Frost Giants":
            case "Fight Jungle Monsters":
                return createActionFailureInfo("model", "selfModel");
            case "Large Dungeon":
            case "Heroes Trial":
            case "The Spire":
            case "Secret Trial":
            case "Gods Trial":
                return createActionFailureInfo("model", "teamModel");
        }
        return createActionFailureInfo("model", "genericModel");
    }

    function getAllowedFailureInfo(_action, {createActionFailureInfo}) {
        return createActionFailureInfo("condition", "listLimitExceeded");
    }

    function getFailureInfo(action, dependencies) {
        const {createActionFailureInfo, curTown, isMultipartAction} = dependencies;
        if (action.townNum !== curTown) {
            return createActionFailureInfo("route", "wrongTown");
        }
        if (action.canStart && !action.canStart()) {
            return getStartFailureInfo(action, dependencies);
        }
        if (isMultipartAction(action) && !action.canMakeProgress(0)) {
            return getProgressFailureInfo(action, dependencies);
        }
        return null;
    }

    global.IdleLoopsRunnerFailure = Object.freeze({
        getGoldFailureThreshold,
        getResourceFailureInfo,
        getStartFailureInfo,
        getProgressFailureInfo,
        getAllowedFailureInfo,
        getFailureInfo,
    });
})(globalThis);
