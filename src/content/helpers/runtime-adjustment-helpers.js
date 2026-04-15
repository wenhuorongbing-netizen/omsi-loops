"use strict";

(function setupRuntimeAdjustmentContentHelpers(global) {
    let cachedHelpers = null;

    const existingRegistry = global.IdleLoopsContentHelperRegistry ?? {};
    const getRuntimeAdjustmentHelpers = function getRuntimeAdjustmentHelpers() {
        if (cachedHelpers) {
            return cachedHelpers;
        }

        function adjustDonations() {
            let town = towns[4];
            let base = Math.round(town.getLevel("Canvassed") * 5 * adjustContentFromPrestige());
            town.totalDonations = Math.floor(base * getSkillMod("Spatiomancy", 900, 1100, .5) + base * getSurveyBonus(town));
        }

        function adjustPylons() {
            let town = towns[5];
            let base = Math.round(town.getLevel("Meander") * 10 * adjustContentFromPrestige());
            town.totalPylons = Math.floor(base * getSkillMod("Spatiomancy", 1000, 1200, .5) + base * getSurveyBonus(town));
        }

        function adjustWells() {
            let town = towns[5];
            let base = Math.round(town.getLevel("Meander") * 10 * adjustContentFromPrestige());
            town.totalWells = Math.floor(base + base * getSurveyBonus(town));
        }

        function adjustPockets() {
            let town = towns[7];
            let base = Math.round(town.getLevel("Excursion") * adjustContentFromPrestige());
            town.totalPockets = Math.floor(base * getSkillMod("Spatiomancy", 1100, 1300, .5) + base * getSurveyBonus(town));
            view.requestUpdate("updateActionTooltips", null);
        }

        function adjustWarehouses() {
            let town = towns[7];
            let base = Math.round(town.getLevel("Excursion") / 2.5 * adjustContentFromPrestige());
            town.totalWarehouses = Math.floor(base * getSkillMod("Spatiomancy", 1200, 1400, .5) + base * getSurveyBonus(town));
            view.requestUpdate("updateActionTooltips", null);
        }

        function adjustInsurance() {
            let town = towns[7];
            let base = Math.round(town.getLevel("Excursion") / 10 * adjustContentFromPrestige());
            town.totalInsurance = Math.floor(base * getSkillMod("Spatiomancy", 1300, 1500, .5) + base * getSurveyBonus(town));
            view.requestUpdate("updateActionTooltips", null);
        }

        function adjustTrainingExpMult() {
            for (let actionName of trainingActions)
            {
                const actionProto = getActionPrototype(actionName);
                // @ts-ignore shh we're pretending it's frozen
                actionProto.expMult = 4 + getBuffLevel("Imbuement3");
                view.adjustExpMult(actionName);
            }
        }

        cachedHelpers = Object.freeze({
            adjustDonations,
            adjustPylons,
            adjustWells,
            adjustPockets,
            adjustWarehouses,
            adjustInsurance,
            adjustTrainingExpMult,
        });

        global.adjustDonations = adjustDonations;
        global.adjustPylons = adjustPylons;
        global.adjustWells = adjustWells;
        global.adjustPockets = adjustPockets;
        global.adjustWarehouses = adjustWarehouses;
        global.adjustInsurance = adjustInsurance;
        global.adjustTrainingExpMult = adjustTrainingExpMult;
        return cachedHelpers;
    };

    global.IdleLoopsContentHelperRegistry = Object.freeze({
        ...existingRegistry,
        getRuntimeAdjustmentHelpers,
    });
})(globalThis);
