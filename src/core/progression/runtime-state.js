"use strict";

(function setupRuntimeState(global) {
    const SECONDS_PER_DAY = 86400;
    const BORROWED_TIME_DAYS = 100;
    const BORROWED_TIME_SECONDS = SECONDS_PER_DAY * BORROWED_TIME_DAYS;
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

    function resolveReturnOfflineTimeMs(totalOfflineMs, totals) {
        const borrowedTimeMs = Math.max((totals?.borrowedTime ?? 0) * 1000, 0);
        return Math.min(BORROWED_TIME_MS, totalOfflineMs, borrowedTimeMs);
    }

    function canReturnBorrowedTime(totalOfflineMs, totals) {
        return resolveReturnOfflineTimeMs(totalOfflineMs, totals) > 0;
    }

    function returnOfflineTime(totalOfflineMs, totals) {
        const returnOfflineMs = resolveReturnOfflineTimeMs(totalOfflineMs, totals);
        if (returnOfflineMs <= 0) {
            return {
                changed: false,
                totalOfflineMs,
            };
        }

        totals.borrowedTime = Math.max(totals.borrowedTime - returnOfflineMs / 1000, 0);
        return {
            changed: true,
            totalOfflineMs: totalOfflineMs - returnOfflineMs,
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
        SECONDS_PER_DAY,
        BORROWED_TIME_DAYS,
        BORROWED_TIME_SECONDS,
        BORROWED_TIME_MS,
        addManaToTimeBudget,
        recordLoopTotals,
        borrowOfflineTime,
        resolveReturnOfflineTimeMs,
        canReturnBorrowedTime,
        returnOfflineTime,
        buildChallengeTimeNeeded,
        snapshotPersistentRunState,
        applyTotalsSnapshot,
    });
})(globalThis);
