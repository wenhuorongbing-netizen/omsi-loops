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
        availableMana ??= 1;
        availableMana = Mana.floor(availableMana);

        const curAction = this.getNextValidAction();
        // out of actions
        if (!curAction) {
            shouldRestart = true;
            return 0;
        }
        this.currentAction = curAction;

        // this is how much mana is actually getting spent during this call to tick().
        let manaToSpend = availableMana;

        // restrict to the number of ticks it takes to get to a next talent level.
        manaToSpend = Math.min(manaToSpend, getMaxTicksForAction(curAction, true));
        // restrict to the number of ticks it takes to finish the current action
        manaToSpend = Math.min(manaToSpend, Mana.ceil(curAction.adjustedTicks - curAction.ticks));
        // just in case
        if (manaToSpend < 0) manaToSpend = 0;

        // we think we'll be spending manaToSpend, but we might not actually finish out the whole
        // amount if this is a multi-part progress action.

        // exp needs to get added AFTER checking multipart progress, since this tick() call may
        // represent any number of ticks, all of which process at the existing levels

        // only for multi-part progress bars
        if (isMultipartAction(curAction)) {
            let loopCosts = {};
            let loopCounter = towns[curAction.townNum][`${curAction.varName}LoopCounter`];
            const loopStats = curAction.loopStats;

            function loopCost(segment) {
                // @ts-ignore
                return loopCosts[segment] ??= curAction.loopCost(segment, loopCounter);
            }

            let segment = 0;
            let curProgress = towns[curAction.townNum][curAction.varName];
            while (curProgress >= loopCost(segment)) {
                curProgress -= loopCost(segment);
                segment++;
            }
            // segment is 0,1,2

            // thanks to Gustav on the discord for the multipart loop code
            let manaLeft = manaToSpend;
            // don't go any further than will get to the next level of whatever stat is being used for this segment
            let manaLeftForCurrentSegment = Math.min(manaLeft, getMaxTicksForStat(curAction, curAction.loopStats[segment], false));
            manaToSpend = 0;
            const tickMultiplier = (curAction.manaCost() / curAction.adjustedTicks);
            let partUpdateRequired = false;

            manaLoop:
            while (manaLeftForCurrentSegment > 0 && curAction.canMakeProgress(segment)) {
                //const toAdd = curAction.tickProgress(segment) * (curAction.manaCost() / curAction.adjustedTicks);
                const loopStat = stats[loopStats[(loopCounter + segment) % loopStats.length]];
                const progressMultiplier = curAction.tickProgress(segment) * tickMultiplier * loopStat.effortMultiplier;
                const toAdd = Math.min(
                    manaLeftForCurrentSegment * progressMultiplier, // how much progress would we make if we spend all available mana?
                    loopCost(segment) - curProgress // how much progress would it take to complete this segment?
                );
                const manaUsed = toAdd / progressMultiplier;
                manaLeftForCurrentSegment -= manaUsed;
                manaLeft -= manaUsed;
                manaToSpend += manaUsed;
                // console.log("using: "+curAction.loopStats[(towns[curAction.townNum][curAction.varName + "LoopCounter"]+segment) % curAction.loopStats.length]+" to add: " + toAdd + " to segment: " + segment + " and part " +towns[curAction.townNum][curAction.varName + "LoopCounter"]+" of progress " + curProgress + " which costs: " + curAction.loopCost(segment));
                towns[curAction.townNum][curAction.varName] += toAdd;
                curProgress += toAdd;
                while (curProgress >= loopCost(segment)) {
                    curProgress -= loopCost(segment);
                    // segment finished
                    if (curAction.segmentFinished) {
                        curAction.segmentFinished();
                        partUpdateRequired = true;
                    }
                    if (segment === curAction.segments - 1) {
                        // part finished
                        if (curAction.name === "Dark Ritual" && towns[curAction.townNum][curAction.varName] >= 4000000) setStoryFlag("darkRitualThirdSegmentReached");
                        if (curAction.name === "Imbue Mind" && towns[curAction.townNum][curAction.varName] >= 700000000) setStoryFlag("imbueMindThirdSegmentReached");
                        towns[curAction.townNum][curAction.varName] = 0;
                        loopCounter = towns[curAction.townNum][`${curAction.varName}LoopCounter`] += curAction.segments;
                        towns[curAction.townNum][`total${curAction.varName}`]++;
                        segment -= curAction.segments;
                        loopCosts = {};
                        curAction.loopsFinished();
                        partUpdateRequired = true;
                        if (curAction.canStart && !curAction.canStart()) {
                            this.completedTicks += curAction.ticks;
                            view.requestUpdate("updateTotalTicks", null);
                            curAction.loopsLeft = 0;
                            curAction.ticks = 0;
                            curAction.manaRemaining = timeNeeded - timer;
                            curAction.goldRemaining = resources.gold;
                            curAction.finish();
                            totals.actions++;
                            break manaLoop;
                        }
                        towns[curAction.townNum][curAction.varName] = curProgress;
                    }
                    segment++;
                    manaLeftForCurrentSegment = Math.min(manaLeft, getMaxTicksForStat(curAction, curAction.loopStats[segment], false));
                }
            }

            view.requestUpdate("updateMultiPartSegments", curAction);
            if (partUpdateRequired) {
                view.requestUpdate("updateMultiPart", curAction);
            }
        }

        curAction.ticks += manaToSpend;
        curAction.manaUsed += manaToSpend;
        curAction.timeSpent += manaToSpend / baseManaPerSecond / getSpeedMult();
        curAction.effectiveTimeElapsed += manaToSpend / baseManaPerSecond / getSpeedMult();

        // exp gets added here, where it can factor in to adjustTicksNeeded
        addExpFromAction(curAction, manaToSpend);

        if (this.currentPos === this.current.length - 1 && options.fractionalMana && curAction.ticks < curAction.adjustedTicks && curAction.ticks >= curAction.adjustedTicks - 0.005) {
            // this is close enough to finished that it shows as e.g. 250.00/250.00 mana used for action
            curAction.ticks = curAction.adjustedTicks;
        }

        if (curAction.ticks >= curAction.adjustedTicks) {
            curAction.ticks = 0;
            curAction.loopsLeft--;

            curAction.lastMana = curAction.rawTicks;
            this.completedTicks += curAction.adjustedTicks;
            curAction.finish();
            totals.actions++;
            curAction.manaRemaining = timeNeeded - timer;
            
            if (curAction.cost) {
                curAction.cost();
            }
            curAction.goldRemaining = resources.gold;

            this.adjustTicksNeeded();
            view.requestUpdate("updateCurrentActionLoops", this.currentPos);
        }
        view.requestUpdate("updateCurrentActionBar", this.currentPos);
        if (curAction.loopsLeft === 0) {
            if (!this.current[this.currentPos + 1] && options.repeatLastAction &&
                (!curAction.canStart || curAction.canStart()) && curAction.townNum === curTown) {
                curAction.loopsLeft++;
                curAction.loops++;
                curAction.extraLoops++;
            } else {
                this.currentPos++;
            }
        }

        return manaToSpend;
    }

    /** @returns {CurrentActionEntry & Action | CurrentActionEntry & MultipartAction} */
    getNextValidAction() {
        let curAction = this.current[this.currentPos];
        if (!curAction) {
            return curAction;
        }
        if (curAction.allowed && getNumOnCurList(curAction.name) > curAction.allowed(true)) {
            curAction.ticks = 0;
            curAction.timeSpent = 0;
            curAction.effectiveTimeElapsed = 0;
            curAction.failureInfo = this.getAllowedFailureInfo(curAction);
            curAction.errorMessage = this.getErrorMessage(curAction, curAction.failureInfo);
            view.requestUpdate("updateCurrentActionBar", this.currentPos);
            return undefined;
        }
        while (curAction) {
            const failureInfo = this.getFailureInfo(curAction);
            if (!failureInfo) {
                curAction.failureInfo = undefined;
                curAction.errorMessage = undefined;
                break;
            }
            curAction.failureInfo = failureInfo;
            curAction.errorMessage = this.getErrorMessage(curAction, failureInfo);
            view.requestUpdate("updateCurrentActionBar", this.currentPos);
            this.currentPos++;
            this.currentAction = null;
            if (this.currentPos >= this.current.length) {
                curAction = undefined;
                break;
            }
            curAction = this.current[this.currentPos];
        }
        if (curAction && this.currentAction !== curAction) {
            this.currentAction = curAction;
            curAction.effectiveTimeElapsed = effectiveTime;
        }
        return curAction;
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo?} */
    getFailureInfo(action) {
        if (action.townNum !== curTown) {
            return createActionFailureInfo("route", "wrongTown");
        }
        if (action.canStart && !action.canStart()) {
            return this.getStartFailureInfo(action);
        }
        if (isMultipartAction(action) && !action.canMakeProgress(0)) {
            return this.getProgressFailureInfo(action);
        }
        return null;
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getAllowedFailureInfo(action) {
        return createActionFailureInfo("condition", "listLimitExceeded");
    }

    /** @param {AnyActionEntry} action @returns {number | undefined} */
    getGoldFailureThreshold(action) {
        if (typeof action.goldCost === "function") {
            const cost = action.goldCost();
            if (Number.isFinite(cost)) return cost;
        }
        switch (action.name) {
            case "Buy Glasses":
            case "Guided Tour":
                return 10;
            case "Donate":
                return 20;
            case "Buy Pickaxe":
                return 200;
            case "Buy Supplies":
                return towns[0].suppliesCost;
            case "Purchase Supplies":
            case "Wizard College":
                return 500;
            case "Pegasus":
                return 200;
            case "Invest":
                return 1;
        }
        return undefined;
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo | null} */
    getResourceFailureInfo(action) {
        const goldThreshold = this.getGoldFailureThreshold(action);
        if (Number.isFinite(goldThreshold) && resources.gold < goldThreshold) {
            return createActionFailureInfo("cost", "goldLow");
        }

        switch (action.name) {
            case "Wizard College":
                if (resources.favors < 10) return createActionFailureInfo("cost", "favorsLow");
                break;
            case "Pegasus":
                if (resources.favors < 20) return createActionFailureInfo("cost", "favorsLow");
                break;
        }

        return null;
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getStartFailureInfo(action) {
        switch (action.name) {
            case "Heal The Sick":
                return createActionFailureInfo("condition", "reputationLow");
            case "Brew Potions":
                if (resources.reputation < 5) return createActionFailureInfo("condition", "reputationLow");
                if (resources.herbs < 10) return createActionFailureInfo("cost", "herbsLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Gamble":
                if (resources.reputation < -5) return createActionFailureInfo("condition", "reputationLow");
                if (resources.gold < 20) return createActionFailureInfo("cost", "goldLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Gather Team":
                if (guild !== "Adventure") return createActionFailureInfo("condition", "adventureGuildRequired");
                if (resources.gold < (resources.teamMembers + 1) * 100) return createActionFailureInfo("cost", "goldLow");
                return createActionFailureInfo("condition", "genericCondition");
            case "Craft Armor":
                return createActionFailureInfo("cost", "hideLow");
            case "Imbue Body":
                return createActionFailureInfo("condition", "imbueBodyRequirement");
            case "Accept Donations":
                return createActionFailureInfo("condition", "positiveReputationRequired");
            case "Raise Zombie":
                return createActionFailureInfo("cost", "bloodLow");
            case "Journey Forth":
                return createActionFailureInfo("cost", "suppliesLow");
            case "Escape":
                return createActionFailureInfo("timing", "escapeWindow");
            case "Open Portal":
                return createActionFailureInfo("condition", "restorationLow");
            case "Gods Trial":
                if (action.currentFloor() >= trialFloors[action.trialNum]) return createActionFailureInfo("exhausted", "completed", "soft");
                if (resources.power >= 7) return createActionFailureInfo("exhausted", "powerCapped", "soft");
                return createActionFailureInfo("condition", "genericCondition");
            case "Challenge Gods":
                if (action.currentFloor() >= trialFloors[action.trialNum]) return createActionFailureInfo("exhausted", "completed", "soft");
                if (resources.power >= 8) return createActionFailureInfo("exhausted", "powerCapped", "soft");
                if (resources.power <= 0) return createActionFailureInfo("condition", "powerRequired");
                return createActionFailureInfo("condition", "genericCondition");
        }

        if (action instanceof TrialAction) {
            if (action.currentFloor() >= trialFloors[action.trialNum]) {
                return createActionFailureInfo("exhausted", "completed", "soft");
            }
            return createActionFailureInfo("condition", "genericCondition");
        }

        if (action instanceof DungeonAction) {
            const loopCounter = towns[action.townNum][`${action.varName}LoopCounter`];
            const currentFloor = Math.floor(loopCounter / action.segments + 0.0000001);
            if (currentFloor >= dungeons[action.dungeonNum].length) {
                return createActionFailureInfo("exhausted", "completed", "soft");
            }
            return createActionFailureInfo("condition", "genericCondition");
        }

        const resourceFailure = this.getResourceFailureInfo(action);
        if (resourceFailure) return resourceFailure;

        return createActionFailureInfo("condition", "genericCondition");
    }

    /** @param {AnyActionEntry} action @returns {ActionFailureInfo} */
    getProgressFailureInfo(action) {
        switch (action.name) {
            case "Dead Trial":
                return createActionFailureInfo("model", "zombieModel");
            case "Challenge Gods":
                return createActionFailureInfo("model", "selfModel");
            case "Small Dungeon":
            case "Fight Frost Giants":
            case "Fight Jungle Monsters":
                return createActionFailureInfo("model", "selfModel");
            case "Large Dungeon":
            case "Heroes Trial":
            case "The Spire":
            case "Secret Trial":
            case "Gods Trial":
                return createActionFailureInfo("model", "teamModel");
        }
        return createActionFailureInfo("model", "genericModel");
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

            for (const action of this.current) {
                action.loops -= action.extraLoops;
                action.loopsLeft = action.loops;
                action.extraLoops = 0;
                action.ticks = 0;
                action.manaUsed = 0;
                action.lastMana = 0;
                action.manaRemaining = 0;
                action.goldRemaining = 0;
                action.timeSpent = 0;
                action.effectiveTimeElapsed = 0;
                action.errorMessage = undefined;
                action.failureInfo = undefined;
            }

        } else {
            this.current = [];
            for (const action of this.#writableNext) {
                // don't add empty/disabled ones
                if (action.loops === 0 || action.disabled) {
                    continue;
                }
                const toAdd = /** @type {AnyActionEntry} */(translateClassNames(action.name));

                toAdd.loopsType = action.loopsType ?? (isMultipartAction(toAdd) ? "maxEffort" : "actions");
                if (isMultipartAction(toAdd) && action.loopsType === "actions") action.loopsType = "maxEffort";
                toAdd.loops = action.loops;
                toAdd.loopsLeft = action.loops;
                toAdd.extraLoops = 0;
                toAdd.ticks = 0;
                toAdd.manaUsed = 0;
                toAdd.lastMana = 0;
                toAdd.manaRemaining = 0;
                toAdd.goldRemaining = 0;
                toAdd.timeSpent = 0;
                toAdd.effectiveTimeElapsed = 0;
                toAdd.errorMessage = undefined;
                toAdd.failureInfo = undefined;

                this.current.push(toAdd);
            }
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
        let remainingTicks = 0;
        for (let i = this.currentPos; i < this.current.length; i++) {
            const action = this.current[i];
            setAdjustedTicks(action);
            remainingTicks += action.loopsLeft * action.adjustedTicks;
        }
        this.totalNeeded = this.completedTicks + remainingTicks;
        view.requestUpdate("updateTotalTicks", null);
    }

    /** @type {ZoneSpan[]} */
    #zoneSpans;
    get zoneSpans() {
        if (!this.#zoneSpans) {
            let currentZones = [0];
            let currentStartIndex = 0;
            this.#zoneSpans = [];
            for (const [index, action] of this.next.entries()) {
                const actionProto = getActionPrototype(action.name);
                if (action.disabled || !action.loops || !actionProto) {
                    continue;
                }
                const travelDeltas = getPossibleTravel(action.name);
                if (!travelDeltas.length) continue;
                if (currentZones.length > 1 && currentZones.includes(actionProto.townNum)) {
                    currentZones = [actionProto.townNum];
                }
                this.#zoneSpans.push(new ZoneSpan(currentStartIndex, index, currentZones, this.#zoneSpans.length, this.next));
                currentStartIndex = index + 1;
                currentZones = travelDeltas.map(x => x + actionProto.townNum);
            }
            this.#zoneSpans.push(new ZoneSpan(currentStartIndex, this.next.length, currentZones, this.#zoneSpans.length, this.next));
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
        return this.next.findIndex(a => a.actionId === Number(actionId));
    }

    getMaxActionId() {
        return Math.max(0, ...this.next.map(a => a.actionId).filter(a => a));
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
        // Number.isFinite(), unlike isFinite(), doesn't coerce its argument so it also functions as a typecheck
        if (!Number.isFinite(toAdd.actionId) || this.findActionWithId(toAdd.actionId)) {
            // define it as immutable and non-enumerable so it doesn't get picked up by save
            Object.defineProperty(toAdd, "actionId", {value: this.getMaxActionId() + 1, configurable: true, writable: false, enumerable: false});
        }
        this.recordLast();
        this.#writableNext.splice(initialOrder, 0, toAdd);
        return initialOrder;
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
        const actionToMove = this.next[initialIndex];
        if (initialIndex < resultingIndex) {
            this.#writableNext.copyWithin(initialIndex, initialIndex + 1, resultingIndex + 1);
        } else {
            this.#writableNext.copyWithin(resultingIndex + 1, resultingIndex, initialIndex);
        }
        this.#writableNext[resultingIndex] = actionToMove;
        return resultingIndex;
    }

    /** @param {number|NextActionEntry} indexOrAction */
    removeAction(indexOrAction) {
        let index = typeof indexOrAction === "number" ? indexOrAction : this.next.indexOf(indexOrAction);
        if (index < 0) index += this.next.length;
        if (index < 0 || index >= this.next.length) return;

        this.recordLast(index);
        return this.#writableNext.splice(index, 1)[0];
    }

    /** @param {number|NextActionEntry} indexOrAction @param {Partial<NextActionEntry>} [update] */
    updateAction(indexOrAction, update) {
        let index = typeof indexOrAction === "number" ? indexOrAction : this.next.indexOf(indexOrAction);
        if (index < 0) index += this.next.length;
        if (index < 0 || index >= this.next.length) return;

        this.recordLast(index, true);
        return Object.assign(this.#writableNext[index], update);
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
            this.#nextLast = structuredClone(this.next);
            for (const [i, action] of this.#nextLast.entries()) {
                // duplicate the non-enumerable property descriptor
                Object.defineProperty(action,"actionId", Object.getOwnPropertyDescriptor(this.next[i], "actionId"));
            }
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
        if (desiredIndex < 0) desiredIndex += this.next.length + 1;
        desiredIndex = clamp(desiredIndex, 0, this.next.length);
        if (townNum == null) return desiredIndex;
        const {zoneSpans} = this;
        const spanIndex = zoneSpans.findIndex(zs => desiredIndex >= zs.ignoringStart(ignoreIndex) && desiredIndex <= zs.ignoringEnd(ignoreIndex));
        if (zoneSpans[spanIndex].zones.includes(townNum)) return desiredIndex;
        let nextValidIndex = Infinity, prevValidIndex = -Infinity;
        for (let index = spanIndex + 1; index < zoneSpans.length; index++) {
            if (zoneSpans[index]?.zones.includes(townNum)) {
                nextValidIndex = zoneSpans[index].ignoringStart(ignoreIndex);
                break;
            }
        }
        for (let index = spanIndex - 1; index >= 0; index--) {
            if (zoneSpans[index]?.zones.includes(townNum)) {
                prevValidIndex = clamp(zoneSpans[index].ignoringEnd(ignoreIndex), 0, this.next.length);
                break;
            }
        }
        if (nextValidIndex === Infinity && prevValidIndex === -Infinity) return desiredIndex; // nowhere is good so anywhere is fine
        return nextValidIndex - desiredIndex <= desiredIndex - prevValidIndex ? nextValidIndex : prevValidIndex; // send it to whichever is closer
    }
}

class ZoneSpan {
    start;
    end;
    zones;
    spanIndex;
    actionList;

    get startAction() {
        return this.actionList[this.start];
    }

    get endAction() {
        return this.actionList[this.end];
    }

    get isCollapsed() {
        // For the zone to count as collapsed, it must:
        // 1. end with an action
        // 2. which is valid and enabled, and is in the right zone
        // 3. and which is marked as collapsed by the user.
        // We only expose the "collapse" arrows on travel actions and only travel actions can end zones, but if not for that
        // it would be permissible to use a non-travel action (like, say, RT from z9) as a collapse source.
        const {endAction, zones} = this;
        
        return endAction
            && Actions.isValidAndEnabled(endAction, 
                                         (_, eproto) => zones.includes(eproto.townNum))
            && !!endAction.collapsed;
    }

    /** @param {number} start @param {number} end @param {number[]} zones @param {number} spanIndex @param {readonly NextActionEntry[]} actionList */
    constructor(start, end, zones, spanIndex, actionList) {
        this.start = start;
        this.end = end;
        this.zones = zones;
        this.spanIndex = spanIndex;
        this.actionList = actionList;
    }

    /** @param {number} [ignoringIndex] */
    ignoringStart(ignoringIndex) {
        if (ignoringIndex == null) return this.start;
        return this.start - (this.start > ignoringIndex ? 1 : 0);
    }

    /** @param {number} [ignoringIndex] */
    ignoringEnd(ignoringIndex) {
        if (ignoringIndex == null) return this.end;
        if (this.end === ignoringIndex) return Infinity; // the final travel action can move as far as it wants
        return this.end - (this.end > ignoringIndex ? 1 : 0);
    }
}

function setAdjustedTicks(action) {
    let newCost = 0;
    for (const actionStatName in action.stats){
        newCost += action.stats[actionStatName] * stats[actionStatName].manaMultiplier;
    }
    action.rawTicks = action.manaCost() * newCost - (options.fractionalMana ? 0 : 0.000001);
    action.adjustedTicks = Math.max(options.fractionalMana ? 0 : 1, Mana.ceil(action.rawTicks));
}

function calcSoulstoneMult(soulstones) {
    return 1 + Math.pow(soulstones, 0.8) / 30;
}

function calcTalentMult(talent) {
    return 1 + Math.pow(talent, 0.4) / 3;
}

// how many ticks would it take to get to the first level up
function getMaxTicksForAction(action, talentOnly=false) {
    let maxTicks = Number.MAX_SAFE_INTEGER;
    const expMultiplier = action.expMult * (action.manaCost() / action.adjustedTicks);
    const overFlow=prestigeBonus("PrestigeExpOverflow") - 1;
    for (const stat of statList) {
        const expToNext = getExpToLevel(stat, talentOnly);
        const statMultiplier = expMultiplier * ((action.stats[stat]??0)+overFlow) * getTotalBonusXP(stat);
        maxTicks = Math.min(maxTicks, Mana.ceil(expToNext / statMultiplier));
    }
    return maxTicks;
}

/** @param {StatName} stat  */
function getMaxTicksForStat(action, stat, talentOnly=false) {
    const expMultiplier = action.expMult * (action.manaCost() / action.adjustedTicks);
    const overFlow=prestigeBonus("PrestigeExpOverflow") - 1;
    const expToNext = getExpToLevel(stat, talentOnly);
    const statMultiplier = expMultiplier * ((action.stats[stat]??0)+overFlow) * getTotalBonusXP(stat);
    return Mana.ceil(expToNext / statMultiplier);
}

function addExpFromAction(action, manaCount) {
    const adjustedExp = manaCount * action.expMult * (action.manaCost() / action.adjustedTicks);
    const overFlow=prestigeBonus("PrestigeExpOverflow") - 1;
    for (const stat of statList) {
        const expToAdd = ((action.stats[stat]??0)+overFlow) * adjustedExp * getTotalBonusXP(stat);

        // Used for updating the menus when hovering over a completed item in the actionList
        const statExp = `statExp${stat}`;
        if (!action[statExp]) {
            action[statExp] = 0;
        }
        action[statExp] += expToAdd;
        addExp(stat, expToAdd);
    }
}

function markActionsComplete(loopCompletedActions) {
    loopCompletedActions.forEach(action => {
        let varName = Action[withoutSpaces(action.name)].varName;
        if (!completedActions.includes(varName)) completedActions.push(varName);
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
