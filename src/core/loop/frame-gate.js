"use strict";

(function setupFrameGate(global) {
    function advanceFrameClock(frameState, dependencies) {
        const delta = dependencies.newTime - frameState.curTime;
        const gameTicksLeft = frameState.gameTicksLeft + delta;
        const radarUpdateTime = dependencies.radarEnabled ? frameState.radarUpdateTime + delta : frameState.radarUpdateTime;
        const curTime = dependencies.newTime;
        const shouldAutosave = curTime - frameState.lastSave > dependencies.autosaveRate * 1000;
        return {
            curTime,
            delta,
            gameTicksLeft,
            radarUpdateTime,
            lastSave: shouldAutosave ? curTime : frameState.lastSave,
            shouldAutosave,
            hasFrameBudget: gameTicksLeft >= 1000 / dependencies.windowFps,
        };
    }

    function resolvePausedFrame(gameTicksLeft, offlineRatio) {
        return {
            offlineDelta: gameTicksLeft * offlineRatio,
            gameTicksLeft: 0,
            clearLag: true,
        };
    }

    function createFrameDeadline(performanceNow, windowFps) {
        return performanceNow + 1000 / windowFps;
    }

    function consumeRadarUpdate(radarUpdateTime, thresholdMs) {
        if (radarUpdateTime > thresholdMs) {
            return {
                radarUpdateTime: radarUpdateTime % thresholdMs,
                shouldUpdateStatGraph: true,
            };
        }
        return {
            radarUpdateTime,
            shouldUpdateStatGraph: false,
        };
    }

    global.IdleLoopsFrameGate = Object.freeze({
        advanceFrameClock,
        resolvePausedFrame,
        createFrameDeadline,
        consumeRadarUpdate,
    });
})(globalThis);
