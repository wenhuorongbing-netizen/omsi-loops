"use strict";

(function setupTownProgress(global) {
    const MAX_PROGRESS_EXP = 505000;

    function restartRegularVars(townState, varNames) {
        for (const varName of varNames) {
            townState[`goodTemp${varName}`] = townState[`good${varName}`];
            townState[`lootFrom${varName}`] = 0;
        }
        return {
            updatedRegularVars: [...varNames],
        };
    }

    function applyProgressGain(townState, varName, expGain, dependencies) {
        if (townState[`exp${varName}`] === MAX_PROGRESS_EXP) {
            return {
                alreadyComplete: true,
                leveledUp: false,
                level: dependencies.getLevel(varName),
            };
        }

        const prevLevel = dependencies.getLevel(varName);
        townState[`exp${varName}`] = Math.min(townState[`exp${varName}`] + expGain, MAX_PROGRESS_EXP);
        const level = dependencies.getLevel(varName);
        return {
            alreadyComplete: false,
            leveledUp: level !== prevLevel,
            prevLevel,
            level,
        };
    }

    function applyRegularCompletion(townState, varName, rewardRatio, rewardFunc, dependencies) {
        let repairedErrorState = false;
        if (townState[`total${varName}`] - townState[`checked${varName}`] < 0) {
            townState[`checked${varName}`] = townState[`total${varName}`];
            townState[`good${varName}`] = Math.floor(townState[`total${varName}`] / rewardRatio);
            townState[`goodTemp${varName}`] = townState[`good${varName}`];
            repairedErrorState = true;
        }

        const shouldCheckUnchecked = townState[`total${varName}`] - townState[`checked${varName}`] > 0
            && ((dependencies.hasSearchToggler && !dependencies.searchTogglerChecked) || townState[`goodTemp${varName}`] <= 0);

        if (shouldCheckUnchecked) {
            townState[`checked${varName}`]++;
            if (townState[`checked${varName}`] % rewardRatio === 0) {
                townState[`lootFrom${varName}`] += rewardFunc();
                townState[`good${varName}`]++;
            }
        } else if (townState[`goodTemp${varName}`] > 0) {
            townState[`goodTemp${varName}`]--;
            townState[`lootFrom${varName}`] += rewardFunc();
        }

        return {
            repairedErrorState,
        };
    }

    function collectLevelUpRegularUpdates(totalActionList, towns) {
        const updates = [];
        for (const action of totalActionList) {
            if (towns[action.townNum].varNames.indexOf(action.varName) !== -1) {
                updates.push({name: action.varName, index: action.townNum});
            }
        }
        return updates;
    }

    function describeProgressEffects(progressState, dependencies) {
        return {
            shouldPauseOnComplete: progressState.alreadyComplete,
            shouldRefreshLockedHidden: progressState.leveledUp,
            regularUpdates: progressState.leveledUp
                ? collectLevelUpRegularUpdates(dependencies.totalActionList, dependencies.towns)
                : [],
            progressUpdate: {name: dependencies.varName, town: dependencies.towns[dependencies.currentTown]},
        };
    }

    global.IdleLoopsTownProgress = Object.freeze({
        restartRegularVars,
        applyProgressGain,
        applyRegularCompletion,
        collectLevelUpRegularUpdates,
        describeProgressEffects,
    });
})(globalThis);
