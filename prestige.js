// Constants used as the base for Prestige exponential bonuses.
const PRESTIGE_COMBAT_BASE       = 1.20;
const PRESTIGE_PHYSICAL_BASE     = 1.20;
const PRESTIGE_MENTAL_BASE       = 1.20;
const PRESTIGE_BARTERING_BASE    = 1.10;
const PRESTIGE_SPATIOMANCY_BASE  = 1.10;
const PRESTIGE_CHRONOMANCY_BASE  = 1.05;
const PRESTIGE_EXP_OVERFLOW_BASE = 1.00222;

function getPrestigeStateApi() {
    const prestigeStateApi = globalThis.IdleLoopsPrestigeState;
    if (!prestigeStateApi) {
        throw new Error("[progression] IdleLoopsPrestigeState is not available");
    }
    return prestigeStateApi;
}

function getRuntimeStateApi() {
    const runtimeStateApi = globalThis.IdleLoopsRuntimeState;
    if (!runtimeStateApi) {
        throw new Error("[progression] IdleLoopsRuntimeState is not available");
    }
    return runtimeStateApi;
}

// All prestige button functions
function completedCurrentGame() {
    console.log("completed current prestige")

    if (getPrestigeStateApi().awardPrestigeCompletion(prestigeValues)) {
        view.updatePrestigeValues();
    }
}

/** @param {PrestigeBuffName} prestigeSelected */
function prestigeUpgrade(prestigeSelected) {
    // Update prestige value
    const costOfPrestige = getPrestigeCost(prestigeSelected);
    if (!getPrestigeStateApi().canAffordPrestige(prestigeValues, costOfPrestige)) {
        console.log("Not enough points available.")
        return;
    } 
    // Confirmation of prestige
    if (!prestigeConfirmation()) {
        return;
    }

    addBuffAmt(prestigeSelected, 1);
    getPrestigeStateApi().spendPrestigePoints(prestigeValues, costOfPrestige);
    
    // Retain certain values between prestiges
    const nextPrestigeBuffs = {
        PrestigePhysical:    getBuffLevel("PrestigePhysical"),
        PrestigeMental:      getBuffLevel("PrestigeMental"),
        PrestigeCombat:      getBuffLevel("PrestigeCombat"),
        PrestigeSpatiomancy: getBuffLevel("PrestigeSpatiomancy"),
        PrestigeChronomancy: getBuffLevel("PrestigeChronomancy"),
        PrestigeBartering:   getBuffLevel("PrestigeBartering"),
        PrestigeExpOverflow: getBuffLevel("PrestigeExpOverflow"),

        // Imbue Soul carry overs between prestiges, but only up to the number of prestiges you have.
        Imbuement3: Math.min(prestigeValues["prestigeTotalCompletions"], getBuffLevel("Imbuement3")), 
    }

    const nextPrestigeValues = getPrestigeStateApi().createPrestigeSnapshot(prestigeValues, {
        completedCurrentPrestige:  false,
    });

    prestigeWithNewValues(nextPrestigeValues, nextPrestigeBuffs)
}

function resetAllPrestiges() {
    // Retain certain values between prestiges
    const nextPrestigeBuffs = {
        PrestigePhysical:    0,
        PrestigeMental:      0,
        PrestigeCombat:      0,
        PrestigeSpatiomancy: 0,
        PrestigeChronomancy: 0,
        PrestigeBartering:   0,
        PrestigeExpOverflow: 0,

        // Imbue Soul carry overs between prestiges, but only up to the number of prestiges you have.
        Imbuement3: Math.min(prestigeValues["prestigeTotalCompletions"], getBuffLevel("Imbuement3")), 
    }

    const nextPrestigeValues = getPrestigeStateApi().createPrestigeSnapshot(prestigeValues, {
        prestigeCurrentPoints:     prestigeValues["prestigeTotalPoints"],
        completedCurrentPrestige:  false,
    });

    prestigeWithNewValues(nextPrestigeValues, nextPrestigeBuffs)
}

/**
 * @param {typeof prestigeValues} nextPrestigeValues
 * @param {{[K in PrestigeBuffName|'Imbuement3']: number}} nextPrestigeBuffs
 */
function prestigeWithNewValues(nextPrestigeValues, nextPrestigeBuffs) {
    const preservedRunState = getRuntimeStateApi().snapshotPersistentRunState(totals, totalOfflineMs);


    // Remove all progress and save totals
    load(false);
    clearList();
    restart();
    pauseGame();


    // Regain prestige values and Totals
    for (const [key, value] of typedEntries(nextPrestigeBuffs)) {
        addBuffAmt(key, 0);     // Set them to 0
        addBuffAmt(key, value); // Then set them to actual value
        view.requestUpdate("updateBuff", key);
    }

    getPrestigeStateApi().applyPrestigeSnapshot(prestigeValues, nextPrestigeValues);
    totals = preservedRunState.totals;
    totalOfflineMs = preservedRunState.totalOfflineMs;
    view.updatePrestigeValues();
    save();
}

function prestigeConfirmation() {
    save();

    if (totals.actions === 0)
    {
        //This helps prevent repeated confirmations, and blowing away your backup when picking a second ability.
        //If you have no actions, then there's nothing worth protecting.
        return true;
    }

    if (window.localStorage[defaultSaveName] && window.localStorage[defaultSaveName] !== "") {
        if (confirm(_txt("menu>prestige_bonus>confirm_prestige"))) {
            for (const town of towns) {
                // this should be done in a more logical way but for now, just make sure to clear these out
                town?.hiddenVars?.clear();
            }
            globalThis.IdleLoopsSaveService.copySaveSlot(window.localStorage, defaultSaveName, "prestigeBackup");
            globalThis.IdleLoopsSaveService.clearSaveSlot(window.localStorage, defaultSaveName);
        } else
            return false;
    }
    return true;
}

/** @param {PrestigeBuffName} prestigeSelected */
function getPrestigeCost(prestigeSelected) {
    var currentCost = 30;

    for (var i = 0; i < getBuffLevel(prestigeSelected); i++) {
        currentCost += 10 + (5 * i)
    }

    return currentCost;
}

/** @param {PrestigeBuffName} prestigeSelected */
function getPrestigeCurrentBonus(prestigeSelected, base) {
    return prestigeBonus(prestigeSelected) > 1 ? 
        prestigeBonus(prestigeSelected) * 100 - 100 :      // *100 - 100 is to get percent values, otherwise 1.02 will just round to 1, rather than 2%.
        0;
}

// Prestige Functions

/** @type {{[B in PrestigeBuffName]?: {calc: number, bonus: number}}} */
const prestigeCache = {};

/** @satisfies {{[B in PrestigeBuffName]: number}} */
const prestigeBases = {
    PrestigeBartering: PRESTIGE_BARTERING_BASE,
    PrestigeChronomancy: PRESTIGE_CHRONOMANCY_BASE,
    PrestigeCombat: PRESTIGE_COMBAT_BASE,
    PrestigeExpOverflow: PRESTIGE_EXP_OVERFLOW_BASE,
    PrestigeMental: PRESTIGE_MENTAL_BASE,
    PrestigePhysical: PRESTIGE_PHYSICAL_BASE,
    PrestigeSpatiomancy: PRESTIGE_SPATIOMANCY_BASE,
};

/** @param {PrestigeBuffName} buff  */
function prestigeBonus(buff) {
    const cache = prestigeCache[buff] ??= {
        calc: -1,
        bonus: -1,
    };
    const level = getBuffLevel(buff);
    if (level !== cache.calc) {
        const base = prestigeBases[buff];
        if (!base) {
            console.error(`No prestige base recorded for buff ${buff}`);
            return 1;
        }
        cache.bonus = Math.pow(base, level);
        cache.calc = level;
    }
    return cache.bonus;
}

function adjustContentFromPrestige() {
    return prestigeBonus("PrestigeSpatiomancy")
}

function adjustGoldCostFromPrestige() {
    return prestigeBonus("PrestigeBartering")
}
