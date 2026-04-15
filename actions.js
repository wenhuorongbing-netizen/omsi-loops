// @ts-check
"use strict";

/**
 * ActionLoopType is an enum that describes what the "loops" property means. Actions without
 * a loopsType property default to the classic behavior of "actions" for non-multipart actions
 * or "maxEffort" for multipart actions.
 * 
 * The comments here assume X as the number specified in "loops" and M as the manaCost() of the
 * action in question.
 * @typedef {"actions"      // perform X actions and then stop
 *         | "maxMana"      // Multipart actions: Spend no more than X * M adjusted mana, stop before starting an action that would overflow
 *         | "maxEffort"    // Multipart actions: Spend no more than X * M original mana, stop before starting an action that would overflow
 *         | "knownGood"    // Limited actions: perform at most X actions, only targeting known-good items
 *         | "unchecked"    // Limited actions: perform at most X actions, only targeting unknown items
 * } ActionLoopType
 */

/** 
 * {@link CurrentActionEntry} is the extra data added to an {@link Action} when it is part of the current loop.
 * {@link AnyActionEntry} is the resulting typedef.
 * 
 * @typedef CurrentActionEntry
 * @prop {ActionLoopType} loopsType
 * @prop {number} loops
 * @prop {number} loopsLeft
 * @prop {number} extraLoops
 * @prop {number} ticks
 * @prop {number} [adjustedTicks]
 * @prop {number} [rawTicks]
 * @prop {number} manaUsed
 * @prop {number} lastMana
 * @prop {number} manaRemaining
 * @prop {number} goldRemaining
 * @prop {number} timeSpent
 * @prop {number} effectiveTimeElapsed
 * @prop {string} [errorMessage]
 * @prop {ActionFailureInfo} [failureInfo]
 * }} 
 * @typedef {CurrentActionEntry & AnyActionType} AnyActionEntry
 */

/**
 * NextActionEntry is the shorthand object stored in {@link Actions.next} array. It does not have an Action prototype.
 * 
 * @typedef NextActionEntry
 * @prop {ActionName} name
 * @prop {number}     loops
 * @prop {boolean}    disabled
 * @prop {boolean}    [collapsed]
 * @prop {ActionLoopType} [loopsType]
 * @prop {number}     [actionId]
 */

/** @param {AnyActionEntry} action @returns {action is MultipartAction} */
function isMultipartAction(action) {
    return 'loopStats' in action;
}

/**
 * @typedef {"route"|"cost"|"condition"|"timing"|"model"|"exhausted"} ActionFailureKind
 * @typedef {"hard"|"soft"} ActionFailureSeverity
 * @typedef {{
 *   kind: ActionFailureKind,
 *   detail: string,
 *   severity: ActionFailureSeverity,
 *   countsAsFailure: boolean,
 *   pauseEligible: boolean,
 * }} ActionFailureInfo
 */

const actionFailureStrings = {
    "en-EN": {
        labels: {
            type: "Failure Type:",
            reason: "Reason:",
        },
        kinds: {
            route: "Route mismatch",
            cost: "Resource shortage",
            condition: "Condition unmet",
            timing: "Bad timing",
            model: "Build mismatch",
            exhausted: "No current target",
        },
        reasons: {
            wrongTown: "Queued for {required}, but your loop was in {current}.",
            reputationLow: "Your current reputation did not meet this action's requirement.",
            positiveReputationRequired: "This action requires positive reputation to proceed.",
            herbsLow: "Your current loop did not have enough herbs for this action.",
            goldLow: "Your current loop did not have enough gold for this action.",
            adventureGuildRequired: "This action requires the adventure guild route to be active.",
            hideLow: "Your current loop did not have enough hide for this action.",
            bloodLow: "Your current loop did not have enough blood for this action.",
            suppliesLow: "Your current loop did not have the supplies needed for travel.",
            escapeWindow: "This action can only begin during its early-loop time window.",
            restorationLow: "Your current restoration level was below this action's requirement.",
            imbueBodyRequirement: "Your current imbuement state or talent baseline was not ready for this action.",
            zombieModel: "Your current zombie build could not generate progress for this action.",
            teamModel: "Your current team build could not generate progress for this action.",
            selfModel: "Your current self-combat build could not generate progress for this action.",
            powerRequired: "This action requires stored power before it can begin.",
            powerCapped: "This action currently has no valid target until power changes.",
            completed: "This action has no remaining target right now.",
            listLimitExceeded: "This action was queued more times than the current loop allows.",
            favorsLow: "Your current loop did not have enough favors for this action.",
            genericCost: "Your current loop could not pay this action's cost.",
            genericCondition: "Your current route or long-term state did not meet this action's requirement.",
            genericModel: "Your current build could not generate progress for this action.",
        },
    },
    "zh-CN": {
        labels: {
            type: "\u5931\u8d25\u5f52\u56e0\uff1a",
            reason: "\u539f\u56e0\uff1a",
        },
        kinds: {
            route: "\u8def\u7ebf\u4e0d\u5bf9",
            cost: "\u8d44\u6e90\u4e0d\u8db3",
            condition: "\u6761\u4ef6\u4e0d\u7b26",
            timing: "\u65f6\u673a\u4e0d\u5bf9",
            model: "\u6784\u7b51\u4e0d\u5bf9",
            exhausted: "\u5f53\u524d\u65e0\u6548",
        },
        reasons: {
            wrongTown: "\u8fd9\u4e2a\u884c\u52a8\u88ab\u6392\u5728 {required}\uff0c\u4f46\u8fd9\u4e00\u8f6e\u5faa\u73af\u5b9e\u9645\u5230\u4e86 {current}\u3002",
            reputationLow: "\u4f60\u5f53\u524d\u7684\u58f0\u671b\u6ca1\u6709\u8fbe\u5230\u8fd9\u4e2a\u884c\u52a8\u7684\u6761\u4ef6\u3002",
            positiveReputationRequired: "\u8fd9\u4e2a\u884c\u52a8\u9700\u8981\u4fdd\u6301\u6b63\u5411\u58f0\u671b\u624d\u80fd\u7ee7\u7eed\u3002",
            herbsLow: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u8349\u836f\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            goldLow: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u91d1\u5e01\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            adventureGuildRequired: "\u8fd9\u4e2a\u884c\u52a8\u9700\u8981\u5f53\u524d\u5904\u5728\u5192\u9669\u8005\u516c\u4f1a\u8def\u7ebf\u4e0a\u3002",
            hideLow: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u517d\u76ae\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            bloodLow: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u8840\u6db2\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            suppliesLow: "\u8fd9\u6b21\u65c5\u884c\u6240\u9700\u7684\u8865\u7ed9\u5728\u5f53\u524d\u5faa\u73af\u4e2d\u6ca1\u6709\u51c6\u5907\u597d\u3002",
            escapeWindow: "\u8fd9\u4e2a\u884c\u52a8\u53ea\u80fd\u5728\u672c\u8f6e\u7684\u65e9\u671f\u65f6\u95f4\u7a97\u53e3\u91cc\u5f00\u59cb\u3002",
            restorationLow: "\u4f60\u5f53\u524d\u7684\u6062\u590d\u7cfb\u7b49\u7ea7\u8fd8\u6ca1\u8fbe\u5230\u8fd9\u4e2a\u884c\u52a8\u7684\u8981\u6c42\u3002",
            imbueBodyRequirement: "\u4f60\u5f53\u524d\u7684\u6ce8\u5165\u8fdb\u5ea6\u6216\u5929\u8d4b\u57fa\u7ebf\u8fd8\u4e0d\u9002\u5408\u6267\u884c\u8fd9\u4e2a\u884c\u52a8\u3002",
            zombieModel: "\u4f60\u5f53\u524d\u7684\u50f5\u5c38\u6784\u7b51\u65e0\u6cd5\u4e3a\u8fd9\u4e2a\u884c\u52a8\u63d0\u4f9b\u6709\u6548\u8fdb\u5ea6\u3002",
            teamModel: "\u4f60\u5f53\u524d\u7684\u961f\u4f0d\u6784\u7b51\u65e0\u6cd5\u4e3a\u8fd9\u4e2a\u884c\u52a8\u63d0\u4f9b\u6709\u6548\u8fdb\u5ea6\u3002",
            selfModel: "\u4f60\u5f53\u524d\u7684\u4e2a\u4eba\u6218\u6597\u6784\u7b51\u65e0\u6cd5\u4e3a\u8fd9\u4e2a\u884c\u52a8\u63d0\u4f9b\u6709\u6548\u8fdb\u5ea6\u3002",
            powerRequired: "\u8fd9\u4e2a\u884c\u52a8\u9700\u8981\u5148\u79ef\u7d2f\u5f53\u524d\u6240\u9700\u7684\u795e\u529b\u3002",
            powerCapped: "\u5728\u795e\u529b\u72b6\u6001\u53d1\u751f\u53d8\u5316\u4e4b\u524d\uff0c\u8fd9\u4e2a\u884c\u52a8\u76ee\u524d\u6ca1\u6709\u53ef\u7528\u76ee\u6807\u3002",
            completed: "\u8fd9\u4e2a\u884c\u52a8\u76ee\u524d\u6ca1\u6709\u5269\u4f59\u76ee\u6807\u4e86\u3002",
            listLimitExceeded: "\u8fd9\u4e2a\u884c\u52a8\u5728\u5f53\u524d\u5217\u8868\u4e2d\u88ab\u6392\u5f97\u6bd4\u5141\u8bb8\u7684\u6b21\u6570\u66f4\u591a\u3002",
            favorsLow: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u4eba\u60c5\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            genericCost: "\u4f60\u8fd9\u4e00\u8f6e\u5faa\u73af\u7684\u8d44\u6e90\u4e0d\u8db3\uff0c\u65e0\u6cd5\u652f\u4ed8\u8fd9\u4e2a\u884c\u52a8\u3002",
            genericCondition: "\u4f60\u5f53\u524d\u7684\u8def\u7ebf\u6216\u957f\u671f\u72b6\u6001\u6ca1\u6709\u6ee1\u8db3\u8fd9\u4e2a\u884c\u52a8\u7684\u6761\u4ef6\u3002",
            genericModel: "\u4f60\u5f53\u524d\u7684\u6784\u7b51\u65e0\u6cd5\u4e3a\u8fd9\u4e2a\u884c\u52a8\u63d0\u4f9b\u6709\u6548\u8fdb\u5ea6\u3002",
        },
    },
};

function getActionFailureLocale() {
    const lang = Localization.currentLang;
    return actionFailureStrings[lang] ?? actionFailureStrings["en-EN"];
}

/** @param {string} template @param {Record<string, string>} values */
function formatActionFailureText(template, values) {
    return template.replace(/\{(\w+)\}/gu, (_match, key) => values[key] ?? "");
}

/** @param {number} townNum */
function getFailureTownLabel(townNum) {
    const townName = getTownName(townNum);
    if (townName) return townName;
    if (Localization.currentLang === "zh-CN") return `\u533a\u57df ${townNum + 1}`;
    return `Zone ${townNum + 1}`;
}

/**
 * @param {ActionFailureKind} kind
 * @param {string} detail
 * @param {ActionFailureSeverity} [severity]
 * @returns {ActionFailureInfo}
 */
function createActionFailureInfo(kind, detail, severity = "hard") {
    const isSoft = severity === "soft";
    return {
        kind,
        detail,
        severity,
        countsAsFailure: !isSoft,
        pauseEligible: !isSoft,
    };
}

/** @param {ActionFailureKind} kind */
function getActionFailureKindLabel(kind) {
    return getActionFailureLocale().kinds[kind];
}

function getActionFailureTypeLabelText() {
    return getActionFailureLocale().labels.type;
}

function getActionFailureReasonLabelText() {
    return getActionFailureLocale().labels.reason;
}

/**
 * @param {ActionFailureInfo} failureInfo
 * @param {AnyActionEntry} action
 */
function getActionFailureReason(failureInfo, action) {
    const {reasons} = getActionFailureLocale();
    switch (failureInfo.detail) {
        case "wrongTown":
            return formatActionFailureText(reasons.wrongTown, {
                required: getFailureTownLabel(action.townNum),
                current: getFailureTownLabel(curTown),
            });
        case "reputationLow":
            return reasons.reputationLow;
        case "positiveReputationRequired":
            return reasons.positiveReputationRequired;
        case "herbsLow":
            return reasons.herbsLow;
        case "goldLow":
            return reasons.goldLow;
        case "adventureGuildRequired":
            return reasons.adventureGuildRequired;
        case "hideLow":
            return reasons.hideLow;
        case "bloodLow":
            return reasons.bloodLow;
        case "suppliesLow":
            return reasons.suppliesLow;
        case "escapeWindow":
            return reasons.escapeWindow;
        case "restorationLow":
            return reasons.restorationLow;
        case "imbueBodyRequirement":
            return reasons.imbueBodyRequirement;
        case "zombieModel":
            return reasons.zombieModel;
        case "teamModel":
            return reasons.teamModel;
        case "selfModel":
            return reasons.selfModel;
        case "powerRequired":
            return reasons.powerRequired;
        case "powerCapped":
            return reasons.powerCapped;
        case "completed":
            return reasons.completed;
        case "listLimitExceeded":
            return reasons.listLimitExceeded;
        case "favorsLow":
            return reasons.favorsLow;
        case "genericCost":
            return reasons.genericCost;
        case "genericModel":
            return reasons.genericModel;
        case "genericCondition":
        default:
            return reasons.genericCondition;
    }
}

function getQueueStore() {
    const queueStore = globalThis.IdleLoopsQueueStore;
    if (!queueStore) {
        throw new Error("[queue] IdleLoopsQueueStore is not available");
    }
    return queueStore;
}

function getRunnerState() {
    const runnerState = globalThis.IdleLoopsRunnerState;
    if (!runnerState) {
        throw new Error("[runner] IdleLoopsRunnerState is not available");
    }
    return runnerState;
}

function getRunnerFailure() {
    const runnerFailure = globalThis.IdleLoopsRunnerFailure;
    if (!runnerFailure) {
        throw new Error("[runner] IdleLoopsRunnerFailure is not available");
    }
    return runnerFailure;
}

function getRunnerSelection() {
    const runnerSelection = globalThis.IdleLoopsRunnerSelection;
    if (!runnerSelection) {
        throw new Error("[runner] IdleLoopsRunnerSelection is not available");
    }
    return runnerSelection;
}

function getRunnerTick() {
    const runnerTick = globalThis.IdleLoopsRunnerTick;
    if (!runnerTick) {
        throw new Error("[runner] IdleLoopsRunnerTick is not available");
    }
    return runnerTick;
}

function getRunnerFormulas() {
    const runnerFormulas = globalThis.IdleLoopsRunnerFormulas;
    if (!runnerFormulas) {
        throw new Error("[runner] IdleLoopsRunnerFormulas is not available");
    }
    return runnerFormulas;
}

function getRunnerFailureDependencies() {
    return {
        createActionFailureInfo,
        curTown,
        guild,
        resources,
        towns,
        dungeons,
        trialFloors,
        TrialAction,
        DungeonAction,
        isMultipartAction,
    };
}

class Actions {
    /** @type {AnyActionEntry[]} */
    current = [];
    /** @readonly @type {readonly Readonly<NextActionEntry>[]} */
    next = [];
    /** @type {readonly Readonly<NextActionEntry>[]} */
    #nextLast;
    addAmount = 1;

    get #writableNext() {
        return /** @type {NextActionEntry[]} */(this.next);
    }

    totalNeeded = 0;
    completedTicks = 0;
    currentPos = 0;
    timeSinceLastUpdate = 0;
    /** @type {AnyActionEntry} */
    currentAction;

    static {
        Data.omitProperties(this.prototype, ["next"]);
    }

    tick(availableMana) {
        availableMana = getRunnerTick().normalizeAvailableMana(availableMana, {Mana});

        const curAction = this.getNextValidAction();
        // out of actions
        if (!curAction) {
            shouldRestart = true;
            return 0;
        }
        this.currentAction = curAction;

        let manaToSpend = getRunnerTick().resolveManaToSpend(availableMana, curAction, {
            getMaxTicksForAction: (action, talentOnly) => getRunnerFormulas().getMaxTicksForAction(action, talentOnly, {
                prestigeBonus,
                statList,
                getExpToLevel,
                getTotalBonusXP,
                Mana,
            }),
            Mana,
        });

        // we think we'll be spending manaToSpend, but we might not actually finish out the whole
        // amount if this is a multi-part progress action.

        // exp needs to get added AFTER checking multipart progress, since this tick() call may
        // represent any number of ticks, all of which process at the existing levels

        // only for multi-part progress bars
        if (isMultipartAction(curAction)) {
            const multipartResult = getRunnerTick().executeMultipartProgress(curAction, manaToSpend, {
                towns,
                stats,
                getMaxTicksForStat: (action, stat, talentOnly) => getRunnerFormulas().getMaxTicksForStat(action, stat, talentOnly, {
                    prestigeBonus,
                    getExpToLevel,
                    getTotalBonusXP,
                    Mana,
                }),
                setStoryFlag,
                timeNeeded,
                timer,
                resources,
                totals,
            });
            manaToSpend = multipartResult.manaSpent;
            this.completedTicks += multipartResult.completedTicksDelta;
            if (multipartResult.shouldUpdateTotalTicks) {
                view.requestUpdate("updateTotalTicks", null);
            }
            view.requestUpdate("updateMultiPartSegments", curAction);
            if (multipartResult.partUpdateRequired) {
                view.requestUpdate("updateMultiPart", curAction);
            }
        }

        getRunnerTick().applyTickState(curAction, manaToSpend, {
            baseManaPerSecond,
            getSpeedMult,
            addExpFromAction: (action, manaCount) => getRunnerFormulas().addExpFromAction(action, manaCount, {
                prestigeBonus,
                statList,
                getTotalBonusXP,
                addExp,
            }),
        });
        getRunnerTick().maybeSnapFractionalTicks(this.currentPos, this.current, curAction, options);

        const completionResult = getRunnerTick().finalizeCompletedAction(curAction, this.completedTicks, {
            timeNeeded,
            timer,
            resources,
            totals,
        });
        this.completedTicks = completionResult.completedTicks;
        if (completionResult.completed) {
            this.adjustTicksNeeded();
            view.requestUpdate("updateCurrentActionLoops", this.currentPos);
        }
        view.requestUpdate("updateCurrentActionBar", this.currentPos);
        this.currentPos = getRunnerTick().advanceCurrentPositionAfterTick(curAction, this.current, this.currentPos, {
            repeatLastAction: options.repeatLastAction,
            curTown,
        });

        return manaToSpend;
    }

    /** @returns {CurrentActionEntry & Action | CurrentActionEntry & MultipartAction} */
    getNextValidAction() {
        const result = getRunnerSelection().resolveNextValidAction(this.current, this.currentPos, this.currentAction, {
            getNumOnCurList,
            getAllowedFailureInfo: action => this.getAllowedFailureInfo(action),
            getFailureInfo: action => this.getFailureInfo(action),
        });
        this.currentPos = result.currentPos;
        if (result.clearCurrentAction) {
            this.currentAction = null;
        }
        for (const blockedAction of result.blockedActions) {
            blockedAction.action.errorMessage = this.getErrorMessage(blockedAction.action, blockedAction.failureInfo);
            view.requestUpdate("updateCurrentActionBar", blockedAction.index);
        }
        if (result.clearedAction) {
            result.clearedAction.errorMessage = undefined;
        }
        if (result.activatedAction) {
            this.currentAction = result.activatedAction;
            result.activatedAction.effectiveTimeElapsed = effectiveTime;
        }
        return result.action;
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo?} */
    getFailureInfo(action) {
        return getRunnerFailure().getFailureInfo(action, getRunnerFailureDependencies());
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getAllowedFailureInfo(action) {
        return getRunnerFailure().getAllowedFailureInfo(action, getRunnerFailureDependencies());
    }

    /** @param {AnyActionEntry} action @returns {number | undefined} */
    getGoldFailureThreshold(action) {
        return getRunnerFailure().getGoldFailureThreshold(action, getRunnerFailureDependencies());
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo | null} */
    getResourceFailureInfo(action) {
        return getRunnerFailure().getResourceFailureInfo(action, getRunnerFailureDependencies());
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getStartFailureInfo(action) {
        return getRunnerFailure().getStartFailureInfo(action, getRunnerFailureDependencies());
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getProgressFailureInfo(action) {
        return getRunnerFailure().getProgressFailureInfo(action, getRunnerFailureDependencies());
    }

    /**
     * @param {AnyActionEntry} action
     * @param {ActionFailureInfo} [failureInfo]
     */
    getErrorMessage(action, failureInfo = action.failureInfo ?? this.getFailureInfo(action)) {
        return failureInfo ? getActionFailureReason(failureInfo, action) : null;
    }

    hasPauseEligibleRemainingActions() {
        return this.current.some(action =>
            action.loopsLeft - action.extraLoops > 0 &&
            (action.failureInfo?.pauseEligible ?? true)
        );
    }

    restart() {
        this.currentPos = 0;
        this.completedTicks = 0;
        this.currentAction = null;
        curTown = 0;
        towns[0].suppliesCost = 300;
        view.requestUpdate("updateResource","supplies");
        curAdvGuildSegment = 0;
        curCraftGuildSegment = 0;
		curWizCollegeSegment = 0;
        curFightFrostGiantsSegment = 0;
        curFightJungleMonstersSegment = 0;
        curThievesGuildSegment = 0;
        curGodsSegment = 0;
        for (const town of towns) {
            for (const action of town.totalActionList) {
                if (action.type === "multipart") {
                    town[action.varName] = 0;
                    town[`${action.varName}LoopCounter`] = 0;
                }
            }
        }
        guild = "";
        hearts = [];
        escapeStarted = false;
        portalUsed = false;
        stoneLoc = 0;
        totalMerchantMana = 7500;
        if (options.keepCurrentList && this.current?.length > 0) {
            this.currentPos = 0;
            this.completedTicks = 0;
            getRunnerState().resetCurrentActions(this.current);
        } else {
            this.current = getRunnerState().createCurrentActionsFromQueue(this.#writableNext, {
                translateClassNames,
                isMultipartAction,
            });
        }
        if (this.current.length === 0) {
            pauseGame();
        }
        this.adjustTicksNeeded();
        view.requestUpdate("updateMultiPartActions");
        view.requestUpdate("updateNextActions");
        view.requestUpdate("updateTime");
        view.requestUpdate("updateActionTooltips");
    }

    adjustTicksNeeded() {
        this.totalNeeded = getRunnerState().calculateTotalNeeded(
            this.current,
            this.currentPos,
            this.completedTicks,
            action => getRunnerFormulas().setAdjustedTicks(action, {stats, options, Mana}),
        );
        view.requestUpdate("updateTotalTicks", null);
    }

    /** @type {ZoneSpan[]} */
    #zoneSpans;
    get zoneSpans() {
        if (!this.#zoneSpans) {
            this.#zoneSpans = getQueueStore().createZoneSpans(this.next, {
                getActionPrototype,
                getPossibleTravel,
                isValidAndEnabled: Actions.isValidAndEnabled,
            });
        }
        return this.#zoneSpans;
    }
    zoneSpanAtIndex(index) {
        return this.zoneSpans.find(zs => index >= zs.start && index <= zs.end);
    }

    /** @type {number} */
    #lastModifiedIndex;

    /** @param {number} actionId  */
    findActionWithId(actionId) {
        const index = this.findIndexOfActionWithId(actionId);
        if (index < 0) return undefined;
        const action = this.next[index];
        return {...action, index};
    }

    /** @param {number} actionId  */
    findIndexOfActionWithId(actionId) {
        return getQueueStore().findIndexOfActionWithId(this.next, actionId);
    }

    getMaxActionId() {
        return getQueueStore().getMaxActionId(this.next);
    }

    /** @param {NextActionEntry} action @param {(action: Readonly<NextActionEntry>, actionProto: Readonly<AnyAction>) => boolean} [additionalTest]  */
    isValidAndEnabled(action, additionalTest) {
        return action && (!action.actionId || this.next.some(a => a.actionId === action.actionId)) && Actions.isValidAndEnabled(action, additionalTest);
    }

    /** @param {NextActionEntry} action @param {(action: Readonly<NextActionEntry>, actionProto: Readonly<AnyAction>) => boolean} [additionalTest]  */
    static isValidAndEnabled(action, additionalTest) {
        const actionProto = getActionPrototype(action?.name);
        return actionProto && !action.disabled && action.loops > 0 && (!additionalTest || additionalTest(action, actionProto));
    }

    /**
     * @param {ActionName}     action
     * @param {number}         [loops]
     * @param {number}         [initialOrder]
     * @param {boolean}        [disabled]
     * @param {ActionLoopType} [loopsType]
     * @returns {number}
     */
    addAction(action, loops = this.addAmount, initialOrder = options.addActionsToTop ? 0 : -1, disabled = false, loopsType = "actions", addAtClosestValidIndex = true) {
        return this.addActionRecord({
            name: action,
            disabled,
            loops,
            loopsType,
        }, initialOrder, addAtClosestValidIndex);
    }

    /** @param {NextActionEntry} toAdd  */
    addActionRecord(toAdd, initialOrder = options.addActionsToTop ? 0 : -1, addAtClosestValidIndex = true) {
        if (initialOrder < 0) initialOrder += this.next.length + 1;
        initialOrder = clamp(initialOrder, 0, this.next.length);
        if (addAtClosestValidIndex) {
            const actionProto = getActionPrototype(toAdd.name);
            initialOrder = this.closestValidIndexForAction(actionProto?.townNum, initialOrder);
        }
        getQueueStore().ensureActionId(this.next, toAdd);
        this.recordLast();
        return getQueueStore().insertActionRecord(this.#writableNext, toAdd, initialOrder);
    }

    /** @param {NextActionEntry[]} records */
    appendActionRecords(records) {
        for (const record of records) {
            this.addActionRecord({...record}, -1, false);
        }
    }

    /** @param {number|NextActionEntry} initialIndexOrAction @param {number} resultingIndex */
    moveAction(initialIndexOrAction, resultingIndex, moveToClosestValidIndex = false) {
        let initialIndex = typeof initialIndexOrAction === "number" ? initialIndexOrAction : this.next.indexOf(initialIndexOrAction);
        if (initialIndex < 0) initialIndex += this.next.length;
        if (resultingIndex < 0) resultingIndex += this.next.length;

        if (initialIndex < 0 || initialIndex >= this.next.length) return -1;

        resultingIndex = clamp(resultingIndex, 0, this.next.length - 1);
        if (moveToClosestValidIndex) {
            const townNum = (getActionPrototype(this.next[initialIndex].name))?.townNum;
            if (townNum != null) {
                resultingIndex = this.closestValidIndexForAction(townNum, resultingIndex, initialIndex);
            }
        }
        if (initialIndex === resultingIndex) return resultingIndex;
        this.recordLast();
        return getQueueStore().moveActionRecord(this.#writableNext, initialIndex, resultingIndex);
    }

    /** @param {number|NextActionEntry} indexOrAction */
    removeAction(indexOrAction) {
        let index = typeof indexOrAction === "number" ? indexOrAction : this.next.indexOf(indexOrAction);
        if (index < 0) index += this.next.length;
        if (index < 0 || index >= this.next.length) return;

        this.recordLast(index);
        return getQueueStore().removeActionRecord(this.#writableNext, index);
    }

    /** @param {number|NextActionEntry} indexOrAction @param {Partial<NextActionEntry>} [update] */
    updateAction(indexOrAction, update) {
        let index = typeof indexOrAction === "number" ? indexOrAction : this.next.indexOf(indexOrAction);
        if (index < 0) index += this.next.length;
        if (index < 0 || index >= this.next.length) return;

        this.recordLast(index, true);
        return getQueueStore().updateActionRecord(this.#writableNext, index, update);
    }

    /** @param {number|NextActionEntry} indexOrAction @param {number} [amountToSplit] @param {number} [targetIndex] */
    splitAction(indexOrAction, amountToSplit, targetIndex, splitToClosestValidIndex = false) {
        let index = typeof indexOrAction === "number" ? indexOrAction : this.next.indexOf(indexOrAction);
        if (index < 0) index += this.next.length;
        if (index < 0 || index >= this.next.length) return;
        
        const action = this.next[index];
        amountToSplit ??= Math.ceil(action.loops / 2);
        targetIndex ??= index;

        if (splitToClosestValidIndex) {
            const townNum = getActionPrototype(action.name)?.townNum;
            if (townNum != null) {
                targetIndex = this.closestValidIndexForAction(townNum, targetIndex);
            }
        }
        const splitIndex = this.addActionRecord({...action, loops: amountToSplit}, targetIndex, splitToClosestValidIndex);
        this.#lastModifiedIndex = index + (splitIndex <= index ? 1 : 0); // tell updateAction not to save this undo
        this.updateAction(this.#lastModifiedIndex, {loops: action.loops - amountToSplit});
    }

    /** @param {(action: Readonly<NextActionEntry>) => boolean} [predicate] */
    clearActions(predicate) {
        if (this.next.length === 0) return;
        this.recordLast();
        if (predicate) {
            this.#writableNext.splice(0, Infinity, ...this.next.filter(a => !predicate(a)));
        } else {
            this.#writableNext.length = 0;
        }
    }

    /** @param {number} [unlessIndex] */
    recordLast(unlessIndex, saveLastModified = false) {
        if (typeof unlessIndex === "undefined" || this.#lastModifiedIndex !== unlessIndex) {
            this.#nextLast = getQueueStore().cloneActionRecords(this.next);
        }
        this.#zoneSpans = null;
        this.#lastModifiedIndex = saveLastModified ? unlessIndex : undefined;
    }

    undoLast() {
        // @ts-ignore - we're overriding readonly
        [this.#writableNext, this.#nextLast] = [this.#nextLast, this.next];
        this.#lastModifiedIndex = undefined;
        this.#zoneSpans = null;
    }

    /** @param {number} townNum @param {number} index  */
    isValidIndexForAction(townNum, index) {
        return this.zoneSpanAtIndex(index)?.zones.includes(townNum) ?? false;
    }

    /** @param {number} townNum @param {number} desiredIndex @param {number} [ignoreIndex]  */
    closestValidIndexForAction(townNum, desiredIndex, ignoreIndex) {
        return getQueueStore().closestValidIndexForAction(this.next, townNum, desiredIndex, ignoreIndex, this.zoneSpans);
    }
}

function markActionsComplete(loopCompletedActions) {
    loopCompletedActions.forEach(action => {
        let varName = Action[withoutSpaces(action.name)].varName;
        globalThis.IdleLoopsWorldState.markCompletedAction(completedActions, varName);
    });
}

function actionStory(loopCompletedActions) {
    loopCompletedActions.forEach(action => {
        let completed = action.loops - action.loopsLeft;
        //Test for completed, because all of the actions in .story(completed) assume it was successfully
        //completed.  Without this we advance the story by putting an action in the list rather than
        // completing it.  We should really have a hook for failure as well.
        if (completed > 0 && action.story !== undefined)
        {
            action.story(completed);
        }
    });
}

function getNumOnList(actionName) {
    let count = 0;
    for (const action of actions.next) {
        if (!action.disabled && action.name === actionName) {
            count += action.loops;
        }
    }
    return count;
}

function getOtherSurveysOnList(surveyName) {
    let count = 0;
    for (const action of actions.next) {
        if (!action.disabled && action.name.startsWith("Survey") && action.name != surveyName) {
            count += action.loops;
        }
    }
    return count;
}

function getNumOnCurList(actionName) {
    let count = 0;
    for (const action of actions.current) {
        if (action.name === actionName) {
            count += action.loops;
        }
    }
    return count;
}
