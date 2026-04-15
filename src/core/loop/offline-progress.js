"use strict";

(function setupOfflineProgress(global) {
    function shouldDisableBonusForOfflineSpend(totalOfflineMs, delta, bonusSpeed) {
        return !!delta && totalOfflineMs + delta < 0 && bonusSpeed > 1;
    }

    function applyOfflineDelta(totalOfflineMs, delta) {
        if (!delta) {
            return totalOfflineMs;
        }
        return Math.max(totalOfflineMs + delta, 0);
    }

    function isBonusActive(bonusActive, bonusSpeed) {
        return bonusActive && bonusSpeed !== 1;
    }

    function toggleOfflineState({totalOfflineMs, bonusActive, bonusSpeed}) {
        if (totalOfflineMs === 0) {
            return {changed: false, bonusActive, bonusSpeed};
        }
        if (!isBonusActive(bonusActive, bonusSpeed)) {
            return {changed: true, bonusActive: true, bonusSpeed: 5};
        }
        return {changed: true, bonusActive: false, bonusSpeed: 1};
    }

    function resolveBonusSpeed({bonusActive, bonusSpeed, options, hasFocus}) {
        if (
            typeof options.speedIncreaseBackground === "number"
            && !isNaN(options.speedIncreaseBackground)
            && options.speedIncreaseBackground >= 0
            && !hasFocus
            && (options.speedIncreaseBackground < 1 || isBonusActive(bonusActive, bonusSpeed))
        ) {
            if (options.speedIncreaseBackground === 1) {
                return 1.00001;
            }
            if (options.speedIncreaseBackground === 0) {
                return 0.0000001;
            }
            return options.speedIncreaseBackground;
        }

        if (!isBonusActive(bonusActive, bonusSpeed)) {
            return 1;
        }

        let resolvedBonusSpeed = bonusSpeed;
        if (options.speedIncrease10x === true) resolvedBonusSpeed = 10;
        if (options.speedIncrease20x === true) resolvedBonusSpeed = 20;
        if (resolvedBonusSpeed < options.speedIncreaseCustom) resolvedBonusSpeed = options.speedIncreaseCustom;
        return resolvedBonusSpeed;
    }

    global.IdleLoopsOfflineProgress = Object.freeze({
        shouldDisableBonusForOfflineSpend,
        applyOfflineDelta,
        isBonusActive,
        toggleOfflineState,
        resolveBonusSpeed,
    });
})(globalThis);
