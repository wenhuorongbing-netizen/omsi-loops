"use strict";

(function setupMetaProgression(global) {
    const DEFAULT_TRAINING_LIMITS = 10;
    const MAX_GOLD_INVESTED = 999999999999;

    function increaseTrainingLimits(trainingLimits, amount = 1) {
        return trainingLimits + amount;
    }

    function resetTrainingLimits() {
        return DEFAULT_TRAINING_LIMITS;
    }

    function addGoldInvestment(goldInvested, amount) {
        if (!Number.isFinite(amount)) {
            return goldInvested;
        }
        return Math.min(goldInvested + amount, MAX_GOLD_INVESTED);
    }

    function incrementStoneUse(stonesUsed, stoneLoc) {
        return {
            ...stonesUsed,
            [stoneLoc]: (stonesUsed[stoneLoc] ?? 0) + 1,
        };
    }

    function createMaxedStoneUseState() {
        return {1: 250, 3: 250, 5: 250, 6: 250};
    }

    global.IdleLoopsMetaProgression = Object.freeze({
        DEFAULT_TRAINING_LIMITS,
        MAX_GOLD_INVESTED,
        increaseTrainingLimits,
        resetTrainingLimits,
        addGoldInvestment,
        incrementStoneUse,
        createMaxedStoneUseState,
    });
})(globalThis);
