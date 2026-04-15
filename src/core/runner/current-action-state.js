"use strict";

(function setupRunnerState(global) {
    function getDefaultLoopsType(action, isMultipartAction) {
        return action.loopsType ?? (isMultipartAction(action) ? "maxEffort" : "actions");
    }

    function initializeCurrentActionState(action) {
        action.loopsLeft = action.loops;
        action.extraLoops = 0;
        action.ticks = 0;
        action.manaUsed = 0;
        action.lastMana = 0;
        action.manaRemaining = 0;
        action.goldRemaining = 0;
        action.timeSpent = 0;
        action.effectiveTimeElapsed = 0;
        action.errorMessage = undefined;
        action.failureInfo = undefined;
        return action;
    }

    function resetCurrentActionState(action) {
        action.loops -= action.extraLoops;
        return initializeCurrentActionState(action);
    }

    function createCurrentActionEntry(queuedAction, {translateClassNames, isMultipartAction}) {
        const currentAction = translateClassNames(queuedAction.name);
        currentAction.loopsType = getDefaultLoopsType(queuedAction, isMultipartAction);
        if (isMultipartAction(currentAction) && queuedAction.loopsType === "actions") {
            queuedAction.loopsType = "maxEffort";
        }
        currentAction.loops = queuedAction.loops;
        return initializeCurrentActionState(currentAction);
    }

    function createCurrentActionsFromQueue(queuedActions, dependencies) {
        const currentActions = [];
        for (const queuedAction of queuedActions) {
            if (queuedAction.loops === 0 || queuedAction.disabled) {
                continue;
            }
            currentActions.push(createCurrentActionEntry(queuedAction, dependencies));
        }
        return currentActions;
    }

    function resetCurrentActions(currentActions) {
        for (const action of currentActions) {
            resetCurrentActionState(action);
        }
        return currentActions;
    }

    function calculateTotalNeeded(currentActions, currentPos, completedTicks, setAdjustedTicks) {
        let remainingTicks = 0;
        for (let index = currentPos; index < currentActions.length; index++) {
            const action = currentActions[index];
            setAdjustedTicks(action);
            remainingTicks += action.loopsLeft * action.adjustedTicks;
        }
        return completedTicks + remainingTicks;
    }

    global.IdleLoopsRunnerState = Object.freeze({
        getDefaultLoopsType,
        initializeCurrentActionState,
        resetCurrentActionState,
        createCurrentActionEntry,
        createCurrentActionsFromQueue,
        resetCurrentActions,
        calculateTotalNeeded,
    });
})(globalThis);
