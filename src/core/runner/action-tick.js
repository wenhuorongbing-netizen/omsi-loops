"use strict";

(function setupRunnerTick(global) {
    function normalizeAvailableMana(availableMana, {Mana}) {
        availableMana ??= 1;
        return Mana.floor(availableMana);
    }

    function resolveManaToSpend(availableMana, action, {getMaxTicksForAction, Mana}) {
        let manaToSpend = availableMana;
        manaToSpend = Math.min(manaToSpend, getMaxTicksForAction(action, true));
        manaToSpend = Math.min(manaToSpend, Mana.ceil(action.adjustedTicks - action.ticks));
        if (manaToSpend < 0) manaToSpend = 0;
        return manaToSpend;
    }

    function executeMultipartProgress(action, manaToSpend, {
        towns,
        stats,
        getMaxTicksForStat,
        setStoryFlag,
        timeNeeded,
        timer,
        resources,
        totals,
    }) {
        let loopCosts = {};
        let loopCounter = towns[action.townNum][`${action.varName}LoopCounter`];
        const loopStats = action.loopStats;

        function loopCost(segment) {
            return loopCosts[segment] ??= action.loopCost(segment, loopCounter);
        }

        let segment = 0;
        let currentProgress = towns[action.townNum][action.varName];
        while (currentProgress >= loopCost(segment)) {
            currentProgress -= loopCost(segment);
            segment++;
        }

        let manaLeft = manaToSpend;
        let manaLeftForCurrentSegment = Math.min(manaLeft, getMaxTicksForStat(action, action.loopStats[segment], false));
        let manaSpent = 0;
        const tickMultiplier = action.manaCost() / action.adjustedTicks;
        let partUpdateRequired = false;
        let completedTicksDelta = 0;
        let shouldUpdateTotalTicks = false;

        manaLoop:
        while (manaLeftForCurrentSegment > 0 && action.canMakeProgress(segment)) {
            const loopStat = stats[loopStats[(loopCounter + segment) % loopStats.length]];
            const progressMultiplier = action.tickProgress(segment) * tickMultiplier * loopStat.effortMultiplier;
            const progressToAdd = Math.min(
                manaLeftForCurrentSegment * progressMultiplier,
                loopCost(segment) - currentProgress,
            );
            const manaUsed = progressToAdd / progressMultiplier;
            manaLeftForCurrentSegment -= manaUsed;
            manaLeft -= manaUsed;
            manaSpent += manaUsed;
            towns[action.townNum][action.varName] += progressToAdd;
            currentProgress += progressToAdd;

            while (currentProgress >= loopCost(segment)) {
                currentProgress -= loopCost(segment);
                if (action.segmentFinished) {
                    action.segmentFinished();
                    partUpdateRequired = true;
                }
                if (segment === action.segments - 1) {
                    if (action.name === "Dark Ritual" && towns[action.townNum][action.varName] >= 4000000) {
                        setStoryFlag("darkRitualThirdSegmentReached");
                    }
                    if (action.name === "Imbue Mind" && towns[action.townNum][action.varName] >= 700000000) {
                        setStoryFlag("imbueMindThirdSegmentReached");
                    }
                    towns[action.townNum][action.varName] = 0;
                    loopCounter = towns[action.townNum][`${action.varName}LoopCounter`] += action.segments;
                    towns[action.townNum][`total${action.varName}`]++;
                    segment -= action.segments;
                    loopCosts = {};
                    action.loopsFinished();
                    partUpdateRequired = true;
                    if (action.canStart && !action.canStart()) {
                        completedTicksDelta += action.ticks;
                        shouldUpdateTotalTicks = true;
                        action.loopsLeft = 0;
                        action.ticks = 0;
                        action.manaRemaining = timeNeeded - timer;
                        action.goldRemaining = resources.gold;
                        action.finish();
                        totals.actions++;
                        break manaLoop;
                    }
                    towns[action.townNum][action.varName] = currentProgress;
                }
                segment++;
                manaLeftForCurrentSegment = Math.min(manaLeft, getMaxTicksForStat(action, action.loopStats[segment], false));
            }
        }

        return {
            manaSpent,
            partUpdateRequired,
            completedTicksDelta,
            shouldUpdateTotalTicks,
        };
    }

    function applyTickState(action, manaToSpend, {baseManaPerSecond, getSpeedMult, addExpFromAction}) {
        action.ticks += manaToSpend;
        action.manaUsed += manaToSpend;
        action.timeSpent += manaToSpend / baseManaPerSecond / getSpeedMult();
        action.effectiveTimeElapsed += manaToSpend / baseManaPerSecond / getSpeedMult();
        addExpFromAction(action, manaToSpend);
        return action;
    }

    function maybeSnapFractionalTicks(currentPos, currentActions, action, {fractionalMana}) {
        if (
            currentPos === currentActions.length - 1
            && fractionalMana
            && action.ticks < action.adjustedTicks
            && action.ticks >= action.adjustedTicks - 0.005
        ) {
            action.ticks = action.adjustedTicks;
        }
        return action;
    }

    function finalizeCompletedAction(action, completedTicks, {timeNeeded, timer, resources, totals}) {
        if (action.ticks < action.adjustedTicks) {
            return {
                completed: false,
                completedTicks,
            };
        }

        action.ticks = 0;
        action.loopsLeft--;
        action.lastMana = action.rawTicks;
        completedTicks += action.adjustedTicks;
        action.finish();
        totals.actions++;
        action.manaRemaining = timeNeeded - timer;

        if (action.cost) {
            action.cost();
        }
        action.goldRemaining = resources.gold;

        return {
            completed: true,
            completedTicks,
        };
    }

    function advanceCurrentPositionAfterTick(action, currentActions, currentPos, {repeatLastAction, curTown}) {
        if (action.loopsLeft !== 0) {
            return currentPos;
        }
        if (!currentActions[currentPos + 1] && repeatLastAction
            && (!action.canStart || action.canStart()) && action.townNum === curTown) {
            action.loopsLeft++;
            action.loops++;
            action.extraLoops++;
            return currentPos;
        }
        return currentPos + 1;
    }

    global.IdleLoopsRunnerTick = Object.freeze({
        normalizeAvailableMana,
        resolveManaToSpend,
        executeMultipartProgress,
        applyTickState,
        maybeSnapFractionalTicks,
        finalizeCompletedAction,
        advanceCurrentPositionAfterTick,
    });
})(globalThis);
