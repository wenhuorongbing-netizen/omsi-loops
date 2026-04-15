"use strict";

(function bootstrapApp(global) {
    let gameSession = null;
    let workerSession = null;
    let contentRegistry = null;

    function resolveLegacyBinding(name, getter) {
        const legacy = global.IdleLoopsLegacy;
        if (!legacy || typeof legacy.resolveBinding !== "function") {
            throw new Error("[bootstrap] IdleLoopsLegacy.resolveBinding is not available");
        }
        return legacy.resolveBinding(name, getter);
    }

    function createSession() {
        const sessionFactory = global.IdleLoopsGameSession;
        if (!sessionFactory || typeof sessionFactory.create !== "function") {
            throw new Error("[bootstrap] IdleLoopsGameSession.create is not available");
        }
        return sessionFactory.create();
    }

    function requireFunction(name) {
        const fn = global[name];
        if (typeof fn !== "function") {
            throw new Error(`[bootstrap] Missing global function: ${name}`);
        }
        return fn;
    }

    function requireViews() {
        const views = resolveLegacyBinding("Views", () => Views);
        if (!views || typeof views.draw !== "function") {
            throw new Error("[bootstrap] Views.draw is not available");
        }
        return views;
    }

    function requireLocalization() {
        const localization = resolveLegacyBinding("Localization", () => Localization);
        if (!localization || typeof localization.localizePage !== "function" || typeof localization.ready?.then !== "function") {
            throw new Error("[bootstrap] Localization is not ready for startup");
        }
        return localization;
    }

    function requirePredictorFactory() {
        const predictorNamespace = resolveLegacyBinding("Koviko", () => Koviko);
        if (!predictorNamespace || typeof predictorNamespace.initWorkerPredictor !== "function") {
            throw new Error("[bootstrap] Koviko.initWorkerPredictor is not available");
        }
        return predictorNamespace;
    }

    function requireContentRegistry() {
        const registry = global.IdleLoopsContentRegistry;
        if (!registry || typeof registry.listActionMetadata !== "function" || typeof registry.listZones !== "function") {
            throw new Error("[bootstrap] IdleLoopsContentRegistry is not available");
        }
        return registry;
    }

    function persistLoadingText() {
        const loadingText = global.document?.getElementById("loadingText");
        if (loadingText) {
            global.localStorage["loadingText"] = loadingText.textContent;
        }
    }

    async function bootstrapGame() {
        const loadDefaults = requireFunction("loadDefaults");
        const startGame = requireFunction("startGame");
        const localization = requireLocalization();
        const views = requireViews();

        loadDefaults();
        await localization.ready;
        views.draw();
        localization.localizePage("game");
        persistLoadingText();
        startGame();
        contentRegistry = requireContentRegistry();
        gameSession = createSession();
        return gameSession;
    }

    function bootstrapPredictorWorker() {
        const loadDefaults = requireFunction("loadDefaults");
        const predictorNamespace = requirePredictorFactory();

        loadDefaults();
        contentRegistry = requireContentRegistry();
        workerSession = createSession();
        return predictorNamespace.initWorkerPredictor();
    }

    global.IdleLoopsBootstrap = Object.freeze({
        bootstrapGame,
        bootstrapPredictorWorker,
        getGameSession() {
            return gameSession;
        },
        getWorkerSession() {
            return workerSession;
        },
        getContentRegistry() {
            return contentRegistry;
        },
    });
})(globalThis);
