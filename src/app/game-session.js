"use strict";

(function setupGameSession(global) {
    class GameSession {
        /**
         * @param {InstanceType<typeof IdleLoopsAppContext.LegacyAppContext>} appContext
         */
        constructor(appContext) {
            this.appContext = appContext;
        }

        captureState() {
            return this.appContext.captureSessionState();
        }

        captureGlobalState(names) {
            return this.appContext.captureGlobalState(names);
        }

        captureSaveState() {
            return this.appContext.captureSaveState();
        }

        applyScalarPatch(patch) {
            return this.appContext.applyScalarState(patch);
        }

        applyGlobalPatch(patch) {
            return this.appContext.applyGlobalState(patch);
        }
    }

    global.IdleLoopsGameSession = Object.freeze({
        GameSession,
        create(appContext = global.IdleLoopsAppContext.getLegacyAppContext()) {
            return new GameSession(appContext);
        },
    });
})(globalThis);
