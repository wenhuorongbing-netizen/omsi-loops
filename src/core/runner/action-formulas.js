"use strict";

(function setupRunnerFormulas(global) {
    function calcSoulstoneMult(soulstones) {
        return 1 + Math.pow(soulstones, 0.8) / 30;
    }

    function calcTalentMult(talent) {
        return 1 + Math.pow(talent, 0.4) / 3;
    }

    function setAdjustedTicks(action, {stats, options, Mana}) {
        let newCost = 0;
        for (const actionStatName in action.stats) {
            newCost += action.stats[actionStatName] * stats[actionStatName].manaMultiplier;
        }
        action.rawTicks = action.manaCost() * newCost - (options.fractionalMana ? 0 : 0.000001);
        action.adjustedTicks = Math.max(options.fractionalMana ? 0 : 1, Mana.ceil(action.rawTicks));
        return action;
    }

    function getMaxTicksForAction(action, talentOnly, {prestigeBonus, statList, getExpToLevel, getTotalBonusXP, Mana}) {
        let maxTicks = Number.MAX_SAFE_INTEGER;
        const expMultiplier = action.expMult * (action.manaCost() / action.adjustedTicks);
        const overFlow = prestigeBonus("PrestigeExpOverflow") - 1;
        for (const stat of statList) {
            const expToNext = getExpToLevel(stat, talentOnly);
            const statMultiplier = expMultiplier * ((action.stats[stat] ?? 0) + overFlow) * getTotalBonusXP(stat);
            maxTicks = Math.min(maxTicks, Mana.ceil(expToNext / statMultiplier));
        }
        return maxTicks;
    }

    function getMaxTicksForStat(action, stat, talentOnly, {prestigeBonus, getExpToLevel, getTotalBonusXP, Mana}) {
        const expMultiplier = action.expMult * (action.manaCost() / action.adjustedTicks);
        const overFlow = prestigeBonus("PrestigeExpOverflow") - 1;
        const expToNext = getExpToLevel(stat, talentOnly);
        const statMultiplier = expMultiplier * ((action.stats[stat] ?? 0) + overFlow) * getTotalBonusXP(stat);
        return Mana.ceil(expToNext / statMultiplier);
    }

    function addExpFromAction(action, manaCount, {prestigeBonus, statList, getTotalBonusXP, addExp}) {
        const adjustedExp = manaCount * action.expMult * (action.manaCost() / action.adjustedTicks);
        const overFlow = prestigeBonus("PrestigeExpOverflow") - 1;
        for (const stat of statList) {
            const expToAdd = ((action.stats[stat] ?? 0) + overFlow) * adjustedExp * getTotalBonusXP(stat);
            const statExp = `statExp${stat}`;
            if (!action[statExp]) {
                action[statExp] = 0;
            }
            action[statExp] += expToAdd;
            addExp(stat, expToAdd);
        }
        return action;
    }

    global.calcSoulstoneMult = calcSoulstoneMult;
    global.calcTalentMult = calcTalentMult;
    global.IdleLoopsRunnerFormulas = Object.freeze({
        calcSoulstoneMult,
        calcTalentMult,
        setAdjustedTicks,
        getMaxTicksForAction,
        getMaxTicksForStat,
        addExpFromAction,
    });
})(globalThis);
