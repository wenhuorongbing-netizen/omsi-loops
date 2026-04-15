"use strict";

(function setupExplorationContentHelpers(global) {
    let cachedHelpers = null;

    const existingRegistry = global.IdleLoopsContentHelperRegistry ?? {};
    const getExplorationHelpers = function getExplorationHelpers() {
        if (cachedHelpers) {
            return cachedHelpers;
        }

function fullyExploredZones() {
    let fullyExplored = 0;
    towns.forEach((town, index) => {
        if (town.getLevel(`SurveyZ${index}`) == 100) fullyExplored++;
    })
    return fullyExplored;
}
function getTotalExploreProgress() {
    //TotalExploreProgress == total of all zones' survey progress.
    let totalExploreProgress = 0;
    towns.forEach((town, index) => {
        if (town.getLevel("SurveyZ"+index)) totalExploreProgress += town.getLevel("SurveyZ"+index);
    });
    return totalExploreProgress;
}
function getExploreProgress() {
    //ExploreProgress == mean of all zones' survey progress, rounded down.
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress == 0) return 0;
    else return Math.max(Math.floor(totalExploreProgress / towns.length), 1);
}
function getExploreExp() {
    //ExploreExp == total survey exp across all zones
    let totalExploreExp = 0;
    towns.forEach((town, index) => {
        if (town.getLevel("SurveyZ"+index)) totalExploreExp += town[`expSurveyZ${index}`];
    });
    return totalExploreExp;
}
function getExploreExpSinceLastProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 1;
    let levelsSinceLastProgress = totalExploreProgress <= 1 ? 1
                                : totalExploreProgress < towns.length * 2 ? totalExploreProgress - 1
                                : totalExploreProgress % towns.length + 1;
    /** @type {{[I in TownNum]?: number}} */
    const levelsPerTown = {};
    /** @param {Town} town  */
    function expSinceLast(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) - (levelsPerTown[town.index] ?? 0);
        if (level === 0 || level === 100) return Infinity;
        if (levelsPerTown[town.index]) {
            return getExpOfSingleLevel(level);
        } else {
            const curExp = town[`exp${varName}`];
            return curExp - getExpOfLevel(level) + 1;
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expSinceLast(a) - expSinceLast(b));
    let totalExpGained = 0;
    while (levelsSinceLastProgress--) {
        totalExpGained += expSinceLast(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expSinceLast(a) - expSinceLast(b));
    }
    return totalExpGained;
}
function getExploreExpToNextProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 0;
    let levelsToNextProgress = totalExploreProgress === 0 ? 1
                             : totalExploreProgress < towns.length * 2 ? towns.length * 2 - totalExploreProgress
                             : towns.length - (totalExploreProgress % towns.length);
    /** @type {{[I in TownNum]?: number}} */
    const levelsPerTown = {};
    /** @param {Town} town  */
    function expToNext(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) + (levelsPerTown[town.index] ?? 0);
        if (level >= 100) return Infinity;
        if (levelsPerTown[town.index]) {
            // we're at a level boundary so we can shortcut
            return getExpOfSingleLevel(level + 1);
        } else {
            return getExpOfLevel(level + 1) - town[`exp${varName}`];
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expToNext(a) - expToNext(b));
    let totalExpNeeded = 0;
    while (levelsToNextProgress--) {
        totalExpNeeded += expToNext(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expToNext(a) - expToNext(b));
    }
    return totalExpNeeded;
}
function getExploreSkill() {
    return Math.floor(Math.sqrt(getExploreProgress()));
}
function exchangeMap() {
    let unfinishedSurveyZones = [];
    towns.forEach((town, index) => {
        if (town.getLevel("Survey") < 100) unfinishedSurveyZones.push(index);
    });
    //For each completed map, give 2*ExploreSkill survey exp to a random unfinished zone's
    //survey progress (if no unfinished zones remain, skip all of this.)
    while (resources.completedMap > 0 && unfinishedSurveyZones.length > 0) {
        let rand = unfinishedSurveyZones[Math.floor(Math.random() * unfinishedSurveyZones.length)];
        let name = "expSurveyZ"+rand;
        towns[rand][name] += getExploreSkill() * 2;
        if (towns[rand][name] >= 505000) {
            towns[rand][name] = 505000;
            for(var i = 0; i < unfinishedSurveyZones.length; i++)
                if ( unfinishedSurveyZones[i] === rand)
                    unfinishedSurveyZones.splice(i, 1);
        }
        view.requestUpdate("updateProgressAction", {name: "SurveyZ"+rand, town: towns[rand]});
        addResource("completedMap", -1);
    }
}

        cachedHelpers = Object.freeze({
            fullyExploredZones,
            getTotalExploreProgress,
            getExploreProgress,
            getExploreExp,
            getExploreExpSinceLastProgress,
            getExploreExpToNextProgress,
            getExploreSkill,
            exchangeMap,
        });

        global.fullyExploredZones = fullyExploredZones;
        global.getTotalExploreProgress = getTotalExploreProgress;
        global.getExploreProgress = getExploreProgress;
        global.getExploreExp = getExploreExp;
        global.getExploreExpSinceLastProgress = getExploreExpSinceLastProgress;
        global.getExploreExpToNextProgress = getExploreExpToNextProgress;
        global.getExploreSkill = getExploreSkill;
        global.exchangeMap = exchangeMap;
        return cachedHelpers;
    };

    global.IdleLoopsContentHelperRegistry = Object.freeze({
        ...existingRegistry,
        getExplorationHelpers,
    });
})(globalThis);
