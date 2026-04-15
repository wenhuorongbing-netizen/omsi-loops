"use strict";

(function setupTownState(global) {
    function expFromLevel(level) {
        return level * (level + 1) * 50;
    }

    function normalizeProgressVarName(varName, townIndex) {
        return varName === "Survey" ? `${varName}Z${townIndex}` : varName;
    }

    function getLevel(townState, varName, townIndex) {
        const normalizedVarName = normalizeProgressVarName(varName, townIndex);
        if (townState.progressScaling[normalizedVarName] === "linear") {
            return Math.floor(townState[`exp${normalizedVarName}`] / 5050);
        }
        return Math.floor((Math.sqrt(8 * townState[`exp${normalizedVarName}`] / 100 + 1) - 1) / 2);
    }

    function getPercentToNext(townState, varName, townIndex) {
        const normalizedVarName = normalizeProgressVarName(varName, townIndex);
        const level = getLevel(townState, varName, townIndex);
        if (level >= 100) return 100;
        if (townState.progressScaling[normalizedVarName] === "linear") {
            return townState[`exp${normalizedVarName}`] / 5050 % 1 * 100;
        }
        const expOfCurLevel = expFromLevel(level);
        const curLevelProgress = townState[`exp${normalizedVarName}`] - expOfCurLevel;
        const nextLevelNeeds = expFromLevel(level + 1) - expOfCurLevel;
        return Math.floor(curLevelProgress / nextLevelNeeds * 100 * 10) / 10;
    }

    function ensureRegularVars(townState, varName) {
        if (townState[`checked${varName}`] === undefined) {
            townState[`checked${varName}`] = 0;
        }
        if (townState[`goodTemp${varName}`] === undefined) {
            townState[`goodTemp${varName}`] = 0;
        }
        if (townState[`good${varName}`] === undefined) {
            townState[`good${varName}`] = 0;
        }
        if (townState[`lootFrom${varName}`] === undefined) {
            townState[`lootFrom${varName}`] = 0;
        }
        if (townState[`total${varName}`] === undefined) {
            townState[`total${varName}`] = 0;
        }
        if (townState.varNames.indexOf(varName) === -1) {
            townState.varNames.push(varName);
            townState.allVarNames.push(varName);
        }
    }

    function ensureProgressVars(townState, varName, progressScaling) {
        if (townState[`exp${varName}`] === undefined) {
            townState[`exp${varName}`] = 0;
        }
        if (townState.progressVars.indexOf(varName) === -1) {
            townState.progressVars.push(varName);
            townState.allVarNames.push(varName);
            townState.progressScaling[varName] = progressScaling;
        }
    }

    function ensureMultipartVars(townState, varName) {
        townState[varName] = 0;
        townState[`${varName}LoopCounter`] = 0;
        if (!townState.multipartVars.includes(varName)) {
            townState.multipartVars.push(varName);
            townState.allVarNames.push(varName);
        }
    }

    function initializeTownActionState(townState, townIndex, dependencies) {
        const lateGameActionNames = new Set(dependencies.lateGameActions);
        let lateGameActionCount = 0;
        let inLateGameActions = true;

        for (const action of dependencies.totalActionList) {
            if (townIndex !== action.townNum) continue;

            if (inLateGameActions) {
                if (lateGameActionNames.has(action.name)) {
                    lateGameActionCount++;
                } else {
                    inLateGameActions = false;
                }
            }
            if (!inLateGameActions && lateGameActionCount > 0 && dependencies.isTravel(action.name)) {
                // shift late-game actions to end of action button list
                townState.totalActionList.push(...townState.totalActionList.splice(0, lateGameActionCount));
                lateGameActionCount = 0;
            }

            townState.totalActionList.push(action);
            if (action.type === "limited") ensureRegularVars(townState, action.varName);
            if (action.type === "progress") ensureProgressVars(townState, action.varName, action.progressScaling);
            if (action.type === "multipart") ensureMultipartVars(townState, action.varName);
        }
    }

    global.IdleLoopsTownState = Object.freeze({
        expFromLevel,
        getLevel,
        getPercentToNext,
        ensureRegularVars,
        ensureProgressVars,
        ensureMultipartVars,
        initializeTownActionState,
    });
})(globalThis);
