"use strict";

(function setupRunnerSelection(global) {
    function resetBlockedActionProgress(action) {
        action.ticks = 0;
        action.timeSpent = 0;
        action.effectiveTimeElapsed = 0;
        return action;
    }

    function resolveNextValidAction(currentActions, currentPos, currentAction, dependencies) {
        const {getNumOnCurList, getAllowedFailureInfo, getFailureInfo} = dependencies;
        /** @type {{index:number, action:any, failureInfo:any}[]} */
        const blockedActions = [];
        let action = currentActions[currentPos];

        if (!action) {
            return {
                action: undefined,
                currentPos,
                clearCurrentAction: false,
                activatedAction: null,
                clearedAction: null,
                blockedActions,
            };
        }

        if (action.allowed && getNumOnCurList(action.name) > action.allowed(true)) {
            resetBlockedActionProgress(action);
            const failureInfo = getAllowedFailureInfo(action);
            action.failureInfo = failureInfo;
            blockedActions.push({index: currentPos, action, failureInfo});
            return {
                action: undefined,
                currentPos,
                clearCurrentAction: false,
                activatedAction: null,
                clearedAction: null,
                blockedActions,
            };
        }

        let clearCurrentAction = false;
        while (action) {
            const failureInfo = getFailureInfo(action);
            if (!failureInfo) {
                action.failureInfo = undefined;
                return {
                    action,
                    currentPos,
                    clearCurrentAction,
                    activatedAction: currentAction !== action ? action : null,
                    clearedAction: action,
                    blockedActions,
                };
            }

            action.failureInfo = failureInfo;
            blockedActions.push({index: currentPos, action, failureInfo});
            currentPos++;
            clearCurrentAction = true;
            if (currentPos >= currentActions.length) {
                return {
                    action: undefined,
                    currentPos,
                    clearCurrentAction,
                    activatedAction: null,
                    clearedAction: null,
                    blockedActions,
                };
            }
            action = currentActions[currentPos];
        }

        return {
            action: undefined,
            currentPos,
            clearCurrentAction,
            activatedAction: null,
            clearedAction: null,
            blockedActions,
        };
    }

    global.IdleLoopsRunnerSelection = Object.freeze({
        resetBlockedActionProgress,
        resolveNextValidAction,
    });
})(globalThis);
