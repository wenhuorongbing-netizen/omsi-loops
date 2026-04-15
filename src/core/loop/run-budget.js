"use strict";

(function setupRunBudget(global) {
    function resolvePostExecutionBudget(state) {
        const budgetPressure = state.baseManaToBurn * state.bonusSpeed;

        if (!state.gameIsStopped && budgetPressure >= 10) {
            const shouldRefundBacklog = !state.cleanExit || state.lagSpeed > 0;
            return {
                refundedOfflineMs: shouldRefundBacklog ? state.gameTicksLeft * state.offlineRatio : 0,
                gameTicksLeft: shouldRefundBacklog ? 0 : state.gameTicksLeft,
                lagManaSpent: (state.originalManaToBurn - state.baseManaToBurn) * state.bonusSpeed,
                clearLag: false,
            };
        }

        if (budgetPressure < 1) {
            return {
                refundedOfflineMs: 0,
                gameTicksLeft: state.gameTicksLeft,
                lagManaSpent: 0,
                clearLag: true,
            };
        }

        return {
            refundedOfflineMs: 0,
            gameTicksLeft: state.gameTicksLeft,
            lagManaSpent: null,
            clearLag: false,
        };
    }

    global.IdleLoopsRunBudget = Object.freeze({
        resolvePostExecutionBudget,
    });
})(globalThis);
