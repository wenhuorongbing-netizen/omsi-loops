"use strict";

(function setupSaveMigrations(global) {
    function applySavedOptions(options, toLoad, persistedUpdateRate) {
        if (toLoad.options === undefined) {
            options.theme = toLoad.currentTheme === undefined ? options.theme : toLoad.currentTheme;
            options.repeatLastAction = toLoad.repeatLast;
            options.pingOnPause = toLoad.pingOnPause === undefined ? options.pingOnPause : toLoad.pingOnPause;
            options.notifyOnPause = toLoad.notifyOnPause === undefined ? options.notifyOnPause : toLoad.notifyOnPause;
            options.autoMaxTraining = toLoad.autoMaxTraining === undefined ? options.autoMaxTraining : toLoad.autoMaxTraining;
            options.highlightNew = toLoad.highlightNew === undefined ? options.highlightNew : toLoad.highlightNew;
            options.hotkeys = toLoad.hotkeys === undefined ? options.hotkeys : toLoad.hotkeys;
            options.updateRate = toLoad.updateRate === undefined ? options.updateRate : persistedUpdateRate ?? toLoad.updateRate;
            return options;
        }

        const optionsToLoad = {...toLoad.options, ...toLoad.extraOptions};
        for (const option in optionsToLoad) {
            if (option in options) {
                options[option] = optionsToLoad[option];
            }
        }
        if ("updateRate" in optionsToLoad && persistedUpdateRate) {
            options.updateRate = persistedUpdateRate;
        }
        return options;
    }

    function migrateVersion75DungeonTotals(toLoad, towns, dungeons) {
        if (toLoad.version75 !== undefined) {
            return false;
        }

        const total = towns[0].totalSDungeon;
        dungeons[0][0].completed = Math.floor(total / 2);
        dungeons[0][1].completed = Math.floor(total / 4);
        dungeons[0][2].completed = Math.floor(total / 8);
        dungeons[0][3].completed = Math.floor(total / 16);
        dungeons[0][4].completed = Math.floor(total / 32);
        dungeons[0][5].completed = Math.floor(total / 64);
        towns[0].totalSDungeon = dungeons[0][0].completed + dungeons[0][1].completed + dungeons[0][2].completed + dungeons[0][3].completed + dungeons[0][4].completed + dungeons[0][5].completed;
        return true;
    }

    function needsLegacyChallengeMigration(toLoad) {
        return toLoad.challenge !== undefined && toLoad.challenge !== 0;
    }

    function createLegacyChallengeMigration(challengeSave, legacyChallengeMode) {
        return {
            bootstrap: {
                ...challengeSave,
                challengeMode: 0,
                inChallenge: true,
            },
            finalize: {
                ...challengeSave,
                challengeMode: legacyChallengeMode,
            },
        };
    }

    global.IdleLoopsSaveMigrations = Object.freeze({
        applySavedOptions,
        migrateVersion75DungeonTotals,
        needsLegacyChallengeMigration,
        createLegacyChallengeMigration,
    });
})(globalThis);
