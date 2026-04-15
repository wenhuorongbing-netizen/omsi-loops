"use strict";

// eslint-disable-next-line prefer-const
let gameSpeed = 1;
const baseManaPerSecond = 50;

let curTime = Date.now();
let gameTicksLeft = 0; // actually milliseconds, not ticks
let refund = false;
let radarUpdateTime = 0;
let timeCounter = 0;
let effectiveTime = 0;
let lastSave = Date.now();
let lagSpeed = 0;

function getGameLoop() {
    const gameLoop = globalThis.IdleLoopsGameLoop;
    if (!gameLoop) {
        throw new Error("[loop] IdleLoopsGameLoop is not available");
    }
    return gameLoop;
}

function getRestartCoordinator() {
    const restartCoordinator = globalThis.IdleLoopsRestartCoordinator;
    if (!restartCoordinator) {
        throw new Error("[loop] IdleLoopsRestartCoordinator is not available");
    }
    return restartCoordinator;
}

function getOfflineProgress() {
    const offlineProgress = globalThis.IdleLoopsOfflineProgress;
    if (!offlineProgress) {
        throw new Error("[loop] IdleLoopsOfflineProgress is not available");
    }
    return offlineProgress;
}

function getGameSpeedApi() {
    const gameSpeedApi = globalThis.IdleLoopsGameSpeed;
    if (!gameSpeedApi) {
        throw new Error("[loop] IdleLoopsGameSpeed is not available");
    }
    return gameSpeedApi;
}

function getLagTracker() {
    const lagTracker = globalThis.IdleLoopsLagTracker;
    if (!lagTracker) {
        throw new Error("[loop] IdleLoopsLagTracker is not available");
    }
    return lagTracker;
}

function getRunBudget() {
    const runBudget = globalThis.IdleLoopsRunBudget;
    if (!runBudget) {
        throw new Error("[loop] IdleLoopsRunBudget is not available");
    }
    return runBudget;
}

function getFrameGate() {
    const frameGate = globalThis.IdleLoopsFrameGate;
    if (!frameGate) {
        throw new Error("[loop] IdleLoopsFrameGate is not available");
    }
    return frameGate;
}

function getResourceStateApi() {
    const resourceStateApi = globalThis.IdleLoopsResourceState;
    if (!resourceStateApi) {
        throw new Error("[domain] IdleLoopsResourceState is not available");
    }
    return resourceStateApi;
}

function getRuntimeStateApi() {
    const runtimeStateApi = globalThis.IdleLoopsRuntimeState;
    if (!runtimeStateApi) {
        throw new Error("[progression] IdleLoopsRuntimeState is not available");
    }
    return runtimeStateApi;
}

function getSpeedMult(zone = curTown) {
    return getGameSpeedApi().calculateSpeedMultiplier(zone, {
        getRitualBonus,
        getSkillBonus,
        getBuffLevel,
        prestigeBonus,
    });
}

function getActualGameSpeed() {
    return getGameSpeedApi().calculateActualGameSpeed(gameSpeed, getSpeedMult(), bonusSpeed);
}

function refreshDungeons(manaSpent) {
    getGameSpeedApi().refreshDungeonChances(dungeons, manaSpent);
}

function singleTick() {
    timer++;
    timeCounter += 1 / baseManaPerSecond;
    effectiveTime += 1 / baseManaPerSecond;

    actions.tick();

    refreshDungeons(1);

    if (shouldRestart || timer >= timeNeeded) {
        loopEnd();
        prepareRestart();
    }
    gameTicksLeft -= ((1000 / baseManaPerSecond));
}

let lastAnimationTime = 0;
let animationFrameRequest = 0;
let animationTicksEnabled = true;

function animationTick(animationTime) {
    if (animationTime == lastAnimationTime || !animationTicksEnabled) {
        // double tick in the same frame, drop this one
        return;
    }
    try {
        tick();
    } finally {
        animationFrameRequest = requestAnimationFrame(animationTick);
    }
}

function tick() {
    const frameAdvance = getFrameGate().advanceFrameClock({
        curTime,
        gameTicksLeft,
        radarUpdateTime,
        lastSave,
    }, {
        newTime: Date.now(),
        radarEnabled: inputElement("radarStats").checked,
        autosaveRate: options.autosaveRate,
        windowFps,
    });
    curTime = frameAdvance.curTime;
    gameTicksLeft = frameAdvance.gameTicksLeft;
    radarUpdateTime = frameAdvance.radarUpdateTime;
    lastSave = frameAdvance.lastSave;

    // save even when paused
    if (frameAdvance.shouldAutosave) {
        save();
    }

    // don't do any updates until we've got enough time built up to match the refresh rate setting
    if (!frameAdvance.hasFrameBudget) {
        return;
    }

    // if (document.getElementById("rewindButton")?.matches(":active")) {
    //     addOffline(gameTicksLeft * offlineRatio);
    //     gameTicksLeft = 0;
    //     if (Data.snapshotStack.length > 2) {
    //         Data.revertToSnapshot(-1);
    //         view.requestUpdate("updateTime", null);
    //         view.requestUpdate("updateCurrentActionLoops", actions.currentPos);
    //         view.requestUpdate("updateCurrentActionBar", actions.currentPos);
    //         view.updateStats();
    //         view.updateSkills();
    //         view.updateBuffs();
    //     }
    //     view.update();
    //     return;
    // }

    if (gameIsStopped) {
        const pausedFrame = getFrameGate().resolvePausedFrame(gameTicksLeft, offlineRatio);
        addOffline(pausedFrame.offlineDelta);
        updateLag(0);
        view.update();
        gameTicksLeft = pausedFrame.gameTicksLeft;
        return;
    }

    const deadline = getFrameGate().createFrameDeadline(performance.now(), windowFps); // don't go past the current frame update time
    // Data.recordSnapshot("tick");

    executeGameTicks(deadline);
}

function executeGameTicks(deadline) {
    let baseManaToBurn = getGameLoop().calculateBaseManaToBurn(gameTicksLeft, {
        baseManaPerSecond,
        gameSpeed,
        Mana,
    });
    const originalManaToBurn = baseManaToBurn;
    const executionResult = getGameLoop().executeBudgetedTicks({
        baseManaToBurn,
        deadline,
        timer,
        timeCounter,
        effectiveTime,
        gameTicksLeft,
        timeNeeded,
        gameSpeed,
        baseManaPerSecond,
        reachedLoopEnd: false,
    }, {
        Mana,
        performanceNow: () => performance.now(),
        isGameStopped: () => gameIsStopped,
        getShouldRestart: () => shouldRestart,
        getBonusSpeed: () => bonusSpeed,
        getFractionalMana: () => options.fractionalMana,
        getTotalOfflineMs: () => totalOfflineMs,
        getSpeedMult,
        actionTick: manaAvailable => actions.tick(manaAvailable),
        addOffline,
        refreshDungeons,
    });
    let cleanExit = executionResult.cleanExit;
    baseManaToBurn = executionResult.baseManaToBurn;
    timer = executionResult.timer;
    timeCounter = executionResult.timeCounter;
    effectiveTime = executionResult.effectiveTime;
    gameTicksLeft = executionResult.gameTicksLeft;
    if (executionResult.reachedLoopEnd) {
        loopEnd();
        prepareRestart();
    }

    const radarState = getFrameGate().consumeRadarUpdate(radarUpdateTime, 100);
    radarUpdateTime = radarState.radarUpdateTime;
    if (radarState.shouldUpdateStatGraph) {
        view.updateStatGraphNeeded = true;
    }

    const runBudgetResult = getRunBudget().resolvePostExecutionBudget({
        gameIsStopped,
        baseManaToBurn,
        bonusSpeed,
        cleanExit,
        lagSpeed,
        gameTicksLeft,
        originalManaToBurn,
        offlineRatio,
    });
    if (runBudgetResult.refundedOfflineMs) {
        addOffline(runBudgetResult.refundedOfflineMs);
    }
    gameTicksLeft = runBudgetResult.gameTicksLeft;
    if (runBudgetResult.lagManaSpent !== null) {
        updateLag(runBudgetResult.lagManaSpent);
    } else if (runBudgetResult.clearLag) {
        updateLag(0);
    }

    view.update();

}

function recalcInterval(fps) {
    windowFps = fps;
    if (mainTickLoop !== undefined) {
        clearInterval(mainTickLoop);
    }
    if (window.requestAnimationFrame) {
        animationFrameRequest = requestAnimationFrame(animationTick);
        mainTickLoop = setInterval(tick, 1000);
    } else {
        mainTickLoop = setInterval(tick, 1000 / fps);
    }
}

function stopGame() {
    gameIsStopped = true;
    view.requestUpdate("updateTime", null);
    view.requestUpdate("updateCurrentActionBar", actions.currentPos);
    view.update();
    document.title = "*PAUSED* Idle Loops";
    document.getElementById("pausePlay").textContent = _txt("time_controls>play_button");
    if (needsDataSnapshots()) {
        Data.updateSnapshot("stop", "base");
    }
    if (options.predictor) {
        view.requestUpdate("updateNextActions");
    }
}

function pauseGame(ping, message) {
    gameIsStopped = !gameIsStopped;
    if (needsDataSnapshots()) {
        Data.discardToSnapshot("base", 1);
        Data.recordSnapshot("pause");
    }
    view.requestUpdate("updateTime", null);
    view.requestUpdate("updateCurrentActionBar", actions.currentPos);
    view.update();
    if (!gameIsStopped && options.notifyOnPause) {
        clearPauseNotification();
    }
    document.title = gameIsStopped ? "*PAUSED* Idle Loops" : "Idle Loops";
    document.getElementById("pausePlay").textContent = _txt(`time_controls>${gameIsStopped ? "play_button" : "pause_button"}`);
    if (gameIsStopped) {
        const pauseAnnouncement = message || (Localization.currentLang?.startsWith("zh") ? "\u6e38\u620f\u5df2\u6682\u505c" : "Game paused");
        globalThis.IdleLoopsAccessibilityController?.announceStatus(pauseAnnouncement, true);
    }
    if (!gameIsStopped && (shouldRestart || timer >= timeNeeded)) {
        restart();
    } else if (ping) {
        if (options.pingOnPause) {
            beep(250);
            setTimeout(() => beep(250), 500);
        }
        if (options.notifyOnPause) {
            showPauseNotification(message || "Game paused!");
        }
    }
}

function loopEnd() {
    if (getRuntimeStateApi().recordLoopTotals(totals, timeCounter, effectiveTime)) {
        view.requestUpdate("updateTotals", null);
        const loopCompletedActions = getRestartCoordinator().collectLoopCompletedActions(actions.current, actions.currentPos);
        markActionsComplete(loopCompletedActions);
        actionStory(loopCompletedActions);
        if (options.highlightNew) {
            view.requestUpdate("removeAllHighlights", null);
            view.requestUpdate("highlightIncompleteActions", null);
        }
    }
}

function prepareRestart() {
    const curAction = actions.getNextValidAction();
    if (getRestartCoordinator().shouldPauseBeforeRestart({
        pauseBeforeRestart: options.pauseBeforeRestart,
        pauseOnFailedLoop: options.pauseOnFailedLoop,
        hasPauseEligibleRemainingActions: actions.hasPauseEligibleRemainingActions(),
    })) {
        if (options.pingOnPause) {
            beep(250);
            setTimeout(() => beep(250), 500);
        }
        if (options.notifyOnPause) {
            showPauseNotification("Game paused!");
        }
        if (curAction) {
            actions.completedTicks += actions.getNextValidAction().ticks;
            view.requestUpdate("updateTotalTicks", null);
        }
        for (let i = 0; i < actions.current.length; i++) {
            view.requestUpdate("updateCurrentActionBar", i);
        }
        stopGame();
    } else {
        restart();
    }
}

function restart() {
    const restartState = getRestartCoordinator().buildRestartState({
        totalsLoops: totals.loops,
        timeNeededInitial,
    });
    shouldRestart = restartState.shouldRestart;
    timer = restartState.timer;
    timeCounter = restartState.timeCounter;
    effectiveTime = restartState.effectiveTime;
    timeNeeded = restartState.timeNeeded;
    document.title = "Idle Loops";
    currentLoop = restartState.currentLoop; // don't let currentLoop get out of sync with totals.loops, that'd cause problems
    resetResources();
    restartStats();
    for (let i = 0; i < towns.length; i++) {
        towns[i].restart();
    }
    view.requestUpdate("updateSkills");
    actions.restart();
    view.requestUpdate("updateCurrentActionsDivs");
    view.requestUpdate("updateTrials", null);
    if (needsDataSnapshots()) {
        Data.updateSnapshot("restart", "base");
    }
}

function manualRestart() {
    loopEnd();
    restart();
    view.update();
}


function addActionToList(name, townNum, isTravelAction, insertAtIndex) {
    for (const action of towns[townNum].totalActionList) {
        if (action.name === name) {
            if (action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.name) < action.allowed())) {
                let addAmount = actions.addAmount;
                if (action.allowed) {
                    const numMax = action.allowed();
                    const numHave = getNumOnList(action.name);
                    if (numMax - numHave < addAmount) {
                        addAmount = numMax - numHave;
                    }
                }
                if (isTravelAction) {
                    const index = actions.addAction(name, 1, insertAtIndex);
                    view.requestUpdate("highlightAction", index);
                } else {
                    const index = actions.addAction(name, addAmount, insertAtIndex);
                    view.requestUpdate("highlightAction", index);
                    if (shiftDown && hasLimit(name)) {
                        capAmount(index, townNum);
                    } else if (shiftDown && isTraining(name)) {
                        capTraining(index);
                    }
                }
            }
        }
    }
    view.updateNextActions();
    view.updateLockedHidden();
}

// mana and resources

function addMana(amount) {
    timeNeeded = getRuntimeStateApi().addManaToTimeBudget(timeNeeded, amount);
}

function addResource(resource, amount) {
    const resourceState = getResourceStateApi().applyResourceDelta(resources, resource, amount);
    view.requestUpdate("updateResource", resourceState.resource);
    if (resourceState.shouldUpdateTeamCombat) {
        view.requestUpdate("updateTeamCombat", null);
    }
}

function resetResource(resource) {
    const resourceState = getResourceStateApi().resetResourceToTemplate(resources, resourcesTemplate, resource);
    view.requestUpdate("updateResource", resourceState.resource);
    if (resourceState.shouldUpdateTeamCombat) {
        view.requestUpdate("updateTeamCombat", null);
    }
}

function resetResources() {
    resources = getResourceStateApi().buildResetResources(resourcesTemplate, {
        copyObject,
        shouldGrantGlasses: getExploreProgress() >= 100 || prestigeValues["completedAnyPrestige"],
    });
    view.requestUpdate("updateResources", null);
}

function changeActionAmount(amount) {
    amount = Math.max(amount, 1);
    amount = Math.min(amount, 1e12);
    actions.addAmount = amount;
    const customInput = inputElement("amountCustom");
    if (document.activeElement !== customInput) {
        customInput.value = amount;
    }
    view.updateAddAmount(amount);
}

function setCustomActionAmount() {
    const value = parseInt(inputElement("amountCustom").value) || 1;
    changeActionAmount(value);
}

function selectLoadout(num) {
    if (curLoadout === num) {
        curLoadout = 0;
    } else {
        curLoadout = num;
    }
    inputElement("renameLoadout").value = loadoutnames[curLoadout - 1] ?? getLoadoutNameDefault();
    view.updateLoadout(curLoadout);
}

function loadLoadout(num) {
    curLoadout = num;
    view.updateLoadout(curLoadout);
    loadList();
}

function getDefaultLoadoutName(num) {
    return _txt("actions>tooltip>loadout_default_name").replace("{num}", `${num}`);
}

function getLoadoutNameDefault() {
    return _txt("actions>tooltip>loadout_name_default");
}

let globalCustomInput = "";
function saveList() {
    if (curLoadout === 0) {
        save();
        return;
    }
    nameList(false);
    loadouts[curLoadout] = copyArray(actions.next);
    view.noteLoadoutSaved(curLoadout);
    save();
    if ((inputElement("renameLoadout").value !== _txt("actions>tooltip>loadout_saved"))) globalCustomInput = inputElement("renameLoadout").value;
    inputElement("renameLoadout").value = _txt("actions>tooltip>loadout_saved");
    setTimeout(() => {
        inputElement("renameLoadout").value = globalCustomInput;
    }, 1000);
}

function nameList(saveGame) {
    // if the loadout has already been saved under a non-numeric name
    // and the user tries to save under a numeric name, the loadout will
    // be saved under an old name
    // if both the old AND the new names are numeric, then we insist on a non-numeric name
    if (isNaN(parseFloat(inputElement("renameLoadout").value))) {
        if (inputElement("renameLoadout").value.length > 30) {
            inputElement("renameLoadout").value = _txt("actions>tooltip>loadout_name_too_long");
        } else if (inputElement("renameLoadout").value !== _txt("actions>tooltip>loadout_saved")) {
            loadoutnames[curLoadout - 1] = inputElement("renameLoadout").value;
        }
    } else if (!isNaN(parseFloat(loadoutnames[curLoadout - 1]))) {
        inputElement("renameLoadout").value = _txt("actions>tooltip>loadout_enter_name");
    }
    document.getElementById(`load${curLoadout}`).textContent = loadoutnames[curLoadout -1];
    view.updateLoadoutManager();
    if (saveGame) save();
}

function loadList() {
    if (curLoadout === 0) {
        return;
    }
    inputElement("amountCustom").value = actions.addAmount.toString();
    actions.clearActions();
    if (loadouts[curLoadout]) {
        actions.appendActionRecords(loadouts[curLoadout]);
    }
    view.updateNextActions();
    view.adjustDarkRitualText();
}

function clearList() {
    actions.clearActions(shiftDown ? (a => (a.disabled || a.loops === 0)) : null);
    view.updateNextActions();
}

function unlockTown(townNum) {
    const unlockState = globalThis.IdleLoopsWorldState.unlockTown(townsUnlocked, townNum);
    if (unlockState.changed) {
        // refresh current
        view.showTown(townNum);
        view.requestUpdate("updateTravelMenu",null);
    }
    globalThis.IdleLoopsChallengeState.recordChallengeTownUnlock(challengeSave, townNum);
    curTown = townNum;
}

function adjustAll() {
    adjustPots();
    adjustLocks();
    adjustSQuests();
    adjustLQuests();
    adjustWildMana();
    adjustHerbs();
    adjustHunt();
    adjustSuckers();
    adjustGeysers();
    adjustMineSoulstones();
    adjustArtifacts();
    adjustDonations();
    adjustWells();
    adjustPylons();
    adjustPockets();
    adjustWarehouses();
    adjustInsurance();
    adjustAllRocks();
    adjustTrainingExpMult();
    view.requestUpdate("adjustManaCost", "Continue On");
}

function capAction(actionId) {
    const action = actions.findActionWithId(actionId);
    if (!action) return;
    if (hasLimit(action.name)) {
        return capAmount(action.index, getActionPrototype(action.name).townNum);
    } else if (isTraining(action.name)) {
        return capTraining(action.index);
    }
}

function capAmount(index, townNum) {
    const action = actions.next[index];
    const varName = `good${getActionPrototype(action.name)?.varName}`;
    let alreadyExisting;
    //if (action.name.startsWith("Survey")) alreadyExisting = getOtherSurveysOnList("") + (action.disabled ? action.loops : 0);
    //else
    alreadyExisting = getNumOnList(action.name) + (action.disabled ? action.loops : 0);
    let newLoops;
    if (action.name.startsWith("Survey")) newLoops = 500 - alreadyExisting;
    if (action.name === "Gather Team") newLoops = 5 + Math.floor(getSkillLevel("Leadership") / 100) - alreadyExisting;
    else newLoops = towns[townNum][varName] - alreadyExisting;
    actions.updateAction(index, {loops: clamp(action.loops + newLoops, 0, null)});
    view.updateNextActions();
    view.updateLockedHidden();
}

function capTraining(index) {
    const action = actions.next[index];
    const alreadyExisting = getNumOnList(action.name) + (action.disabled ? action.loops : 0);
    const newLoops = trainingLimits - alreadyExisting;
    actions.updateAction(index, {loops: clamp(action.loops + newLoops, 0, null)});
    view.updateNextActions();
    view.updateLockedHidden();
}

function capAllTraining() {
    for (const [index,action] of actions.next.entries())
    {
        // @ts-ignore
        if (trainingActions.includes(action.name)) {
            //console.log("Training Action on list: " + action.name);
            capTraining(index);
        }
    }

}

function addLoop(actionId) {
    const action = actions.findActionWithId(actionId);
    const theClass = getActionPrototype(action.name);
    let addAmount = actions.addAmount;
    if (theClass.allowed) {
        const numMax = theClass.allowed();
        const numHave = getNumOnList(theClass.name) + (action.disabled ? action.loops : 0);
        if ((numMax - numHave) < addAmount) {
            addAmount = numMax - numHave;
        }
    }
    actions.updateAction(action.index, {loops: clamp(action.loops + addAmount, 0, 1e12)});
    view.updateNextActions();
    view.updateLockedHidden();
}
function removeLoop(actionId) {
    const action = actions.findActionWithId(actionId);
    actions.updateAction(action.index, {loops: clamp(action.loops - actions.addAmount, 0, 1e12)});
    view.updateNextActions();
    view.updateLockedHidden();
}
function split(actionId) {
    const action = actions.findActionWithId(actionId);
    actions.splitAction(action.index);
    view.updateNextActions();
}

function collapse(actionId) {
    const action = actions.findActionWithId(actionId);
    actions.updateAction(action.index, {collapsed: !action.collapsed});
    view.updateNextActions();
}

function showNotification(name) {
    const notification = document.getElementById(`${name}Notification`);
    if (notification) notification.style.display = "block";
    globalThis.IdleLoopsAccessibilityController?.announceNamedNotification(name);
}

function hideNotification(name) {
    unreadActionStories = unreadActionStories.filter(toRead => toRead !== name);
    const notification = document.getElementById(`${name}Notification`);
    if (notification) notification.style.display = "none";
}

function hideActionIcons() {
    document.getElementById("nextActionsList").className = "disabled";
}

function showActionIcons() {
    document.getElementById("nextActionsList").className = "";
}

function handleDragStart(event) {
    const index = event.target.getAttribute("data-action-id");
    draggedDecorate(index);
    event.dataTransfer.setData("text/html", index);
    hideActionIcons();
}

function handleDirectActionDragStart(event, actionName, townNum, actionVarName, isTravelAction) {
    // @ts-ignore
    document.getElementById(`container${actionVarName}`).children[2].style.display = "none";
    const actionData = { _actionName: actionName, _townNum: townNum, _isTravelAction: isTravelAction };
    const serialData = JSON.stringify(actionData);
    event.dataTransfer.setData("actionData", serialData);
    hideActionIcons();
}


function handleDirectActionDragEnd(actionVarName) {
    // @ts-ignore
    document.getElementById(`container${actionVarName}`).children[2].style.display = "";
    showActionIcons();
}


function handleDragOver(event) {
    event.preventDefault();
}

function handleDragDrop(event) {
    const idOfDroppedOverElement = event.target.getAttribute("data-action-id");
    const indexOfDroppedOverElement = actions.findIndexOfActionWithId(idOfDroppedOverElement);
    dragExitUndecorate(idOfDroppedOverElement);
    const initialId = event.dataTransfer.getData("text/html");
    if (initialId === "") {
        const actionData = JSON.parse(event.dataTransfer.getData("actionData"));
        addActionToList(actionData._actionName, actionData._townNum, actionData._isTravelAction, indexOfDroppedOverElement);
    } else {
        moveQueuedAction(actions.findIndexOfActionWithId(initialId), indexOfDroppedOverElement);
    }
    showActionIcons();
}

function moveQueuedAction(initialIndex, resultingIndex) {
    if (initialIndex < 0 || initialIndex > actions.next.length || resultingIndex < 0 || resultingIndex > actions.next.length - 1) {
        return;
    }

    actions.moveAction(initialIndex, resultingIndex, true);
    
    view.updateNextActions();
}

function moveUp(actionId) {
    const index = actions.findIndexOfActionWithId(actionId);
    if (index <= 0) {
        return;
    }
    actions.moveAction(index, index - 1);
    view.updateNextActions();
}
function moveDown(actionId) {
    const index = actions.findIndexOfActionWithId(actionId);
    if (index >= actions.next.length - 1) {
        return;
    }
    actions.moveAction(index, index + 1);
    view.updateNextActions();
}
function disableAction(actionId) {
    const index = actions.findIndexOfActionWithId(actionId);
    const action = actions.next[index];
    const translated = getActionPrototype(action.name);
    if (action.disabled) {
        if (!translated.allowed || getNumOnList(action.name) + action.loops <= translated.allowed()) actions.updateAction(index, {disabled: false});
    } else {
        actions.updateAction(index, {disabled: true});
    }
    view.updateNextActions();
    view.requestUpdate("updateLockedHidden", null);
}
function removeAction(actionId) {
    const index = actions.findIndexOfActionWithId(actionId);
    actions.removeAction(index);
    view.updateNextActions();
    view.requestUpdate("updateLockedHidden", null);
}

function borrowTime() {
    totalOfflineMs = getRuntimeStateApi().borrowOfflineTime(totalOfflineMs, totals);
    view.requestUpdate("updateOffline", null);
    view.requestUpdate("updateTotals", null);
}

function returnTime() {
    const returnState = getRuntimeStateApi().returnOfflineTime(totalOfflineMs, totals);
    if (returnState.changed) {
        totalOfflineMs = returnState.totalOfflineMs;
        view.requestUpdate("updateOffline", null);
        view.requestUpdate("updateTotals", null);
    }
}

let lagStart = 0;
let lagSpent = 0;
function updateLag(manaSpent) {
    const nextLagState = getLagTracker().updateLagState({
        lagStart,
        lagSpent,
        lagSpeed,
    }, manaSpent, {
        performanceNow: () => performance.now(),
        baseManaPerSecond,
    });
    lagStart = nextLagState.lagStart;
    lagSpent = nextLagState.lagSpent;
    lagSpeed = nextLagState.lagSpeed;
    if (nextLagState.bonusTextNeedsUpdate) {
        view.requestUpdate("updateBonusText", null);
    }
}

function addOffline(num) {
    if (num) {
        if (getOfflineProgress().shouldDisableBonusForOfflineSpend(totalOfflineMs, num, bonusSpeed)) {
            toggleOffline();
        }
        totalOfflineMs = getOfflineProgress().applyOfflineDelta(totalOfflineMs, num);
        view.requestUpdate("updateOffline", null);
    }
}

function toggleOffline() {
    const toggledState = getOfflineProgress().toggleOfflineState({
        totalOfflineMs,
        bonusActive,
        bonusSpeed,
    });
    if (!toggledState.changed) return;

    bonusActive = toggledState.bonusActive;
    bonusSpeed = toggledState.bonusSpeed;
    if (bonusActive) {
        checkExtraSpeed();
    }
    document.getElementById("isBonusOn").textContent = _txt(`time_controls>bonus_seconds>state>${bonusActive ? "on" : "off"}`);
    setOption("bonusIsActive", bonusActive, true);
    view.requestUpdate("updateTime", null);
}

function isBonusActive() {
    return getOfflineProgress().isBonusActive(bonusActive, bonusSpeed);
}

function checkExtraSpeed() {
    view.requestUpdate("updateBonusText", null);
    bonusSpeed = getOfflineProgress().resolveBonusSpeed({
        bonusActive,
        bonusSpeed,
        options,
        hasFocus: document.hasFocus(),
    });
}
