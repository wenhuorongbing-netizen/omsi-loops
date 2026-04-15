"use strict";

(function setupCharacterState(global) {
    function applySkillExp(skills, name, amount, dependencies) {
        const adjustedAmount = (name === "Combat" || name === "Pyromancy" || name === "Restoration")
            ? amount * (1 + dependencies.getBuffLevel("Heroism") * 0.02)
            : amount;
        const oldLevel = dependencies.getSkillLevel(name);
        skills[name].levelExp.addExp(adjustedAmount);
        const newLevel = dependencies.getSkillLevel(name);
        return {
            adjustedAmount,
            oldLevel,
            newLevel,
            leveledUp: oldLevel !== newLevel,
        };
    }

    function applyBuffAmount(buffs, buffHardCaps, name, amount) {
        const oldLevel = buffs[name].amt;
        if (oldLevel === buffHardCaps[name]) {
            return {
                changed: false,
                oldLevel,
                newLevel: oldLevel,
            };
        }

        buffs[name].amt += amount;
        if (amount === 0) {
            buffs[name].amt = 0;
        }

        return {
            changed: true,
            oldLevel,
            newLevel: buffs[name].amt,
        };
    }

    function applyStatExp(stats, name, amount, totalTalent, talentMultiplier) {
        stats[name].statLevelExp.addExp(amount);
        stats[name].soullessLevelExp.addExp(amount / stats[name].soulstoneMult);
        const talentGain = amount * talentMultiplier;
        stats[name].talentLevelExp.addExp(talentGain);
        return {
            totalTalent: totalTalent + talentGain,
            talentGain,
        };
    }

    function resetStatLevels(stats, statList, wunderkindLevel, imbueBodyLevel) {
        const statBaseLevel = wunderkindLevel > 0 ? imbueBodyLevel * 2 : imbueBodyLevel;
        for (const statName of statList) {
            stats[statName].statLevelExp.setLevel(statBaseLevel);
        }
        return statBaseLevel;
    }

    function addSoulstonesToStat(stats, statName, amount) {
        stats[statName].soulstone = (stats[statName].soulstone ?? 0) + amount;
        return stats[statName].soulstone;
    }

    function setTalentLevel(stats, statName, targetTalentLevel) {
        stats[statName].talentLevelExp.setLevel(targetTalentLevel);
        return targetTalentLevel;
    }

    function setSoulstone(stats, statName, targetSoulstone) {
        stats[statName].soulstone = targetSoulstone;
        return targetSoulstone;
    }

    function loadBuffSnapshot(buffs, sourceBuffs, buffHardCaps) {
        for (const property in sourceBuffs ?? {}) {
            if (Object.prototype.hasOwnProperty.call(sourceBuffs, property) && property in buffs) {
                buffs[property].amt = Math.min(sourceBuffs[property].amt, buffHardCaps[property]);
            }
        }
        return buffs;
    }

    function resetTalentAndSoulstones(stats, statList) {
        for (const statName of statList) {
            stats[statName].talentLevelExp.setLevel(0);
            stats[statName].soulstone = 0;
        }
        return [...statList];
    }

    function resetBuffAmounts(buffs, buffNames) {
        for (const buffName of buffNames) {
            buffs[buffName].amt = 0;
        }
        return [...buffNames];
    }

    global.IdleLoopsCharacterState = Object.freeze({
        applySkillExp,
        applyBuffAmount,
        applyStatExp,
        resetStatLevels,
        addSoulstonesToStat,
        setTalentLevel,
        setSoulstone,
        loadBuffSnapshot,
        resetTalentAndSoulstones,
        resetBuffAmounts,
    });
})(globalThis);
