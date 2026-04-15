"use strict";

(function setupLagTracker(global) {
    function resetLagState(lagState) {
        return {
            lagStart: lagState.lagStart,
            lagSpent: lagState.lagSpent,
            lagSpeed: 0,
            bonusTextNeedsUpdate: lagState.lagSpeed !== 0,
        };
    }

    function updateLagState(lagState, manaSpent, dependencies) {
        if (manaSpent === 0) {
            return resetLagState(lagState);
        }

        if (lagState.lagSpeed === 0) {
            return {
                lagStart: dependencies.performanceNow(),
                lagSpent: 0,
                lagSpeed: 1,
                bonusTextNeedsUpdate: false,
            };
        }

        const nextLagSpent = lagState.lagSpent + manaSpent;
        const now = dependencies.performanceNow();
        const measuredSpeed = nextLagSpent / (now - lagState.lagStart) * 1000 / dependencies.baseManaPerSecond;
        return {
            lagStart: lagState.lagStart,
            lagSpent: nextLagSpent,
            lagSpeed: measuredSpeed,
            bonusTextNeedsUpdate: true,
        };
    }

    global.IdleLoopsLagTracker = Object.freeze({
        resetLagState,
        updateLagState,
    });
})(globalThis);
