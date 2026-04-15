"use strict";

(function setupPrestigeState(global) {
    const PRESTIGE_COMPLETION_REWARD = 90;

    function createPrestigeSnapshot(prestigeValues, overrides = {}) {
        return {
            prestigeCurrentPoints: prestigeValues.prestigeCurrentPoints,
            prestigeTotalPoints: prestigeValues.prestigeTotalPoints,
            prestigeTotalCompletions: prestigeValues.prestigeTotalCompletions,
            completedCurrentPrestige: prestigeValues.completedCurrentPrestige,
            completedAnyPrestige: prestigeValues.completedAnyPrestige,
            ...overrides,
        };
    }

    function awardPrestigeCompletion(prestigeValues, reward = PRESTIGE_COMPLETION_REWARD) {
        if (prestigeValues.completedCurrentPrestige) {
            return false;
        }

        prestigeValues.prestigeCurrentPoints += reward;
        prestigeValues.prestigeTotalPoints += reward;
        prestigeValues.prestigeTotalCompletions += 1;
        prestigeValues.completedCurrentPrestige = true;
        prestigeValues.completedAnyPrestige = true;
        return true;
    }

    function canAffordPrestige(prestigeValues, cost) {
        return prestigeValues.prestigeCurrentPoints >= cost;
    }

    function spendPrestigePoints(prestigeValues, cost) {
        if (!canAffordPrestige(prestigeValues, cost)) {
            return false;
        }

        prestigeValues.prestigeCurrentPoints -= cost;
        return true;
    }

    function applyPrestigeSnapshot(prestigeValues, nextPrestigeValues) {
        prestigeValues.prestigeCurrentPoints = nextPrestigeValues.prestigeCurrentPoints.valueOf();
        prestigeValues.prestigeTotalPoints = nextPrestigeValues.prestigeTotalPoints.valueOf();
        prestigeValues.prestigeTotalCompletions = nextPrestigeValues.prestigeTotalCompletions.valueOf();
        prestigeValues.completedCurrentPrestige = nextPrestigeValues.completedCurrentPrestige.valueOf();
        prestigeValues.completedAnyPrestige = nextPrestigeValues.completedAnyPrestige.valueOf();
        return prestigeValues;
    }

    function replacePrestigeValues(prestigeValues, nextPrestigeValues) {
        for (const key of Object.keys(prestigeValues)) {
            delete prestigeValues[key];
        }
        return applyPrestigeSnapshot(prestigeValues, nextPrestigeValues);
    }

    function resetPrestigeValues(prestigeValues) {
        return replacePrestigeValues(prestigeValues, {
            prestigeCurrentPoints: 0,
            prestigeTotalPoints: 0,
            prestigeTotalCompletions: 0,
            completedCurrentPrestige: false,
            completedAnyPrestige: false,
        });
    }

    global.IdleLoopsPrestigeState = Object.freeze({
        PRESTIGE_COMPLETION_REWARD,
        createPrestigeSnapshot,
        awardPrestigeCompletion,
        canAffordPrestige,
        spendPrestigePoints,
        applyPrestigeSnapshot,
        replacePrestigeValues,
        resetPrestigeValues,
    });
})(globalThis);
