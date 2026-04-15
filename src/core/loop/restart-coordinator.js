"use strict";

(function setupRestartCoordinator(global) {
    function collectLoopCompletedActions(currentActions, currentPos) {
        const loopCompletedActions = currentActions.slice(0, currentPos);
        if (currentActions[currentPos] !== undefined && currentActions[currentPos].loopsLeft < currentActions[currentPos].loops) {
            loopCompletedActions.push(currentActions[currentPos]);
        }
        return loopCompletedActions;
    }

    function shouldPauseBeforeRestart({pauseBeforeRestart, pauseOnFailedLoop, hasPauseEligibleRemainingActions}) {
        return pauseBeforeRestart || (pauseOnFailedLoop && hasPauseEligibleRemainingActions);
    }

    function buildRestartState({totalsLoops, timeNeededInitial}) {
        return {
            shouldRestart: false,
            timer: 0,
            timeCounter: 0,
            effectiveTime: 0,
            timeNeeded: timeNeededInitial,
            currentLoop: totalsLoops + 1,
        };
    }

    global.IdleLoopsRestartCoordinator = Object.freeze({
        collectLoopCompletedActions,
        shouldPauseBeforeRestart,
        buildRestartState,
    });
})(globalThis);
