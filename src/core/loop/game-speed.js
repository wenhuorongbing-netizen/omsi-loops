"use strict";

(function setupGameSpeed(global) {
    function calculateSpeedMultiplier(zone, dependencies) {
        const {
            getRitualBonus,
            getSkillBonus,
            getBuffLevel,
            prestigeBonus,
        } = dependencies;

        let speedMult = 1;

        // Dark Ritual
        if (zone === 0) speedMult *= getRitualBonus(0, 20, 10);
        else if (zone === 1) speedMult *= getRitualBonus(20, 40, 5);
        else if (zone === 2) speedMult *= getRitualBonus(40, 60, 2.5);
        else if (zone === 3) speedMult *= getRitualBonus(60, 80, 1.5);
        else if (zone === 4) speedMult *= getRitualBonus(80, 100, 1);
        else if (zone === 5) speedMult *= getRitualBonus(100, 150, .5);
        else if (zone === 6) speedMult *= getRitualBonus(150, 200, .5);
        else if (zone === 7) speedMult *= getRitualBonus(200, 250, .5);
        else if (zone === 8) speedMult *= getRitualBonus(250, 300, .5);
        speedMult *= getRitualBonus(300, 666, .1);

        // Chronomancy
        speedMult *= getSkillBonus("Chronomancy");

        // Imbue Soul
        speedMult *= 1 + 0.5 * getBuffLevel("Imbuement3");

        // Prestige Chronomancy
        speedMult *= prestigeBonus("PrestigeChronomancy");

        return speedMult;
    }

    function calculateActualGameSpeed(gameSpeed, speedMult, bonusSpeed) {
        return gameSpeed * speedMult * bonusSpeed;
    }

    function refreshDungeonChances(dungeons, manaSpent) {
        for (const dungeon of dungeons) {
            for (const level of dungeon) {
                const chance = level.ssChance;
                if (chance < 1) level.ssChance = Math.min(chance + 0.0000001 * manaSpent, 1);
            }
        }
    }

    global.IdleLoopsGameSpeed = Object.freeze({
        calculateSpeedMultiplier,
        calculateActualGameSpeed,
        refreshDungeonChances,
    });
})(globalThis);
