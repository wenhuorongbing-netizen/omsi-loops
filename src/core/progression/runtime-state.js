"use strict";

(function setupRuntimeState(global) {
    const BORROWED_TIME_SECONDS = 86400;
    const BORROWED_TIME_MS = BORROWED_TIME_SECONDS * 1000;

    function addManaToTimeBudget(timeNeeded, amount) {
        return timeNeeded + amount;
    }

    function recordLoopTotals(totals, timeCounter, effectiveTime) {
        if (effectiveTime <= 0) {
            return false;
        }

        totals.time += timeCounter;
        totals.effectiveTime += effectiveTime;
        totals.loops += 1;
        return true;
    }

    function borrowOfflineTime(totalOfflineMs, totals) {
        totals.borrowedTime += BORROWED_TIME_SECONDS;
        return totalOfflineMs + BORROWED_TIME_MS;
    }

    function canReturnBorrowedTime(totalOfflineMs) {
        return totalOfflineMs >= BORROWED_TIME_MS;
    }

    function returnOfflineTime(totalOfflineMs, totals) {
        if (!canReturnBorrowedTime(totalOfflineMs)) {
            return {
                changed: false,
                totalOfflineMs,
            };
        }

        totals.borrowedTime -= BORROWED_TIME_SECONDS;
        return {
            changed: true,
            totalOfflineMs: totalOfflineMs - BORROWED_TIME_MS,
        };
    }

    function buildChallengeTimeNeeded(totalBudget, totalsEffectiveTime, manaPerSecond) {
        return totalBudget - totalsEffectiveTime * manaPerSecond;
    }

    function snapshotPersistentRunState(totals, totalOfflineMs) {
        return {
            totals,
            totalOfflineMs,
        };
    }

    function applyTotalsSnapshot(totals, nextTotals) {
        for (const key of Object.keys(totals)) {
            delete totals[key];
        }
        Object.assign(totals, nextTotals ?? {});
        return totals;
    }

    global.IdleLoopsRuntimeState = Object.freeze({
        BORROWED_TIME_SECONDS,
        BORROWED_TIME_MS,
        addManaToTimeBudget,
        recordLoopTotals,
        borrowOfflineTime,
        canReturnBorrowedTime,
        returnOfflineTime,
        buildChallengeTimeNeeded,
        snapshotPersistentRunState,
        applyTotalsSnapshot,
    });
})(globalThis);
