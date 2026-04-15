"use strict";
function getTownStateApi() {
    const townStateApi = globalThis.IdleLoopsTownState;
    if (!townStateApi) {
        throw new Error("[domain] IdleLoopsTownState is not available");
    }
    return townStateApi;
}

function getTownProgressApi() {
    const townProgressApi = globalThis.IdleLoopsTownProgress;
    if (!townProgressApi) {
        throw new Error("[progression] IdleLoopsTownProgress is not available");
    }
    return townProgressApi;
}
/**
 * @template {string} [VN=never]
 * @template {string} [PVN=never]
 * @template {string} [MVN=never]
 * @typedef {{
 *  [K in 
 *  `checked${VN}`
 * |`goodTemp${VN}`
 * |`good${VN}`
 * |`lootFrom${VN}`
 * |`total${VN}`
 * |`exp${PVN}`
 * |`total${MVN}`
 * |`${MVN}`
 * |`${MVN}LoopCounter`
 *      ]?: number
 * }} TownVarDefs
 */
/**
 * @template {number} TN
 * @typedef {TownVarDefs<
 *          ActionVarOfTownAndType<TN,"limited">,
 *          ActionVarOfTownAndType<TN,"progress">,
 *          ActionVarOfTownAndType<TN,"multipart">
 *          >} TownVars
 */
/**
 * @template {number} TN
 * @typedef {keyof TownVars<TN>} TownVarNames
 */
/** @template {Town<number>} T @typedef {T extends Town<infer TN> ? TN : never} NumOfTown */
/**
 * @template {number} TN Town number
 */
class Town {
    /** @type {TN} */
    index;
    /** @type {string[]} */
    allVarNames = [];
    /** @type {string[]} */
    varNames = [];
    /** @type {string[]} */
    progressVars = [];
    /** @type {string[]} */
    multipartVars = [];
    /** @type {Record<string, ProgressScalingType>} */
    progressScaling = {};
    /** @type {AnyAction[]} */
    totalActionList = [];
    /** @type {Set<string>} */
    hiddenVars = new Set();

    static {
        Data.omitProperties(this.prototype, ["hiddenVars"]);
    }

    unlocked() {
        return townsUnlocked.includes(this.index);
    };

    expFromLevel(level) {
        return getTownStateApi().expFromLevel(level);
    };

    getLevel(varName) {
        return getTownStateApi().getLevel(this, varName, this.index);
    };

    restart() {
        const restartState = getTownProgressApi().restartRegularVars(this, this.varNames);
        for (const varName of restartState.updatedRegularVars) {
            view.requestUpdate("updateRegular",{name: varName, index: this.index});
        }
    };

    finishProgress(varName, expGain) {
        const progressState = getTownProgressApi().applyProgressGain(this, varName, expGain, {
            getLevel: currentVarName => this.getLevel(currentVarName),
        });
        const progressEffects = getTownProgressApi().describeProgressEffects(progressState, {
            varName,
            currentTown: curTown,
            totalActionList,
            towns,
        });
        if (progressEffects.shouldPauseOnComplete) {
            if (options.pauseOnComplete) pauseGame(true, _txt("actions>tooltip>progress_complete_paused"));
            else return;
        }
        if (progressEffects.shouldRefreshLockedHidden) {
            view.requestUpdate("updateLockedHidden", null);
            adjustAll();
            for (const regularUpdate of progressEffects.regularUpdates) {
                view.requestUpdate("updateRegular", regularUpdate);
            }
        }
        view.requestUpdate("updateProgressAction", progressEffects.progressUpdate);
    };

    getPrcToNext(varName) {
        return getTownStateApi().getPercentToNext(this, varName, this.index);
    };

    // finishes actions that have checkable aspects
    finishRegular(varName, rewardRatio, rewardFunc) {
        const searchToggler = inputElement(`searchToggler${varName}`, false, false);
        const regularState = getTownProgressApi().applyRegularCompletion(this, varName, rewardRatio, rewardFunc, {
            hasSearchToggler: !!searchToggler,
            searchTogglerChecked: !!searchToggler?.checked,
        });
        if (regularState.repairedErrorState) {
            console.log("Error state fixed");
        }
        view.requestUpdate("updateRegular", {name: varName, index: this.index});
    };

    createVars(varName) {
        getTownStateApi().ensureRegularVars(this, varName);
    };

    /** @param {ProgressScalingType} [progressScaling] */
    createProgressVars(varName, progressScaling = "default") {
        getTownStateApi().ensureProgressVars(this, varName, progressScaling);
    };

    createMultipartVars(varName) {
        getTownStateApi().ensureMultipartVars(this, varName);
    }

    constructor(index) {
        this.index = index;
        getTownStateApi().initializeTownActionState(this, this.index, {
            totalActionList,
            lateGameActions,
            isTravel,
        });
    }
}
