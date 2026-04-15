"use strict";

(function setupChallengeState(global) {
    function createChallengeSaveSnapshot(challengeSave = {}, overrides = {}) {
        return {
            ...challengeSave,
            challengeMode: challengeSave.challengeMode ?? 0,
            inChallenge: challengeSave.inChallenge ?? false,
            ...overrides,
        };
    }

    function applyChallengeSaveSnapshot(challengeSave, nextChallengeSave) {
        for (const key of Object.keys(challengeSave)) {
            delete challengeSave[key];
        }
        Object.assign(challengeSave, nextChallengeSave ?? {});
        return challengeSave;
    }

    function recordChallengeTownUnlock(challengeSave, townNum) {
        const challengeMode = challengeSave.challengeMode ?? 0;
        if (challengeMode === 0) {
            return false;
        }

        const progressKey = `c${challengeMode}`;
        const currentBest = challengeSave[progressKey];
        if (currentBest === undefined || currentBest < townNum) {
            challengeSave[progressKey] = townNum;
            return true;
        }

        return false;
    }

    global.IdleLoopsChallengeState = Object.freeze({
        createChallengeSaveSnapshot,
        applyChallengeSaveSnapshot,
        recordChallengeTownUnlock,
    });
})(globalThis);
