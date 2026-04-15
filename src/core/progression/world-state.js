"use strict";

(function setupWorldState(global) {
    function createProgressionCollectionsSnapshot(toLoad) {
        return {
            townsUnlocked: toLoad.maxTown
                ? Array.from({length: toLoad.maxTown + 1}, (_, index) => index)
                : toLoad.townsUnlocked === undefined ? [0] : [...toLoad.townsUnlocked],
            completedActions: [
                ...(toLoad.completedActions ?? []),
                "FoundGlasses",
            ],
        };
    }

    function unlockTown(townsUnlocked, townNum) {
        if (townsUnlocked.includes(townNum)) {
            return {
                changed: false,
                townsUnlocked: [...townsUnlocked],
            };
        }

        townsUnlocked.push(townNum);
        townsUnlocked.sort((left, right) => left - right);
        return {
            changed: true,
            townsUnlocked: [...townsUnlocked],
        };
    }

    function markCompletedAction(completedActions, varName) {
        if (completedActions.includes(varName)) {
            return false;
        }

        completedActions.push(varName);
        return true;
    }

    function applyProgressionCollections(townsUnlocked, completedActions, collections) {
        townsUnlocked.splice(0, townsUnlocked.length, ...(collections.townsUnlocked ?? []));
        completedActions.splice(0, completedActions.length, ...(collections.completedActions ?? []));
        return {
            townsUnlocked: [...townsUnlocked],
            completedActions: [...completedActions],
        };
    }

    global.IdleLoopsWorldState = Object.freeze({
        createProgressionCollectionsSnapshot,
        unlockTown,
        markCompletedAction,
        applyProgressionCollections,
    });
})(globalThis);
