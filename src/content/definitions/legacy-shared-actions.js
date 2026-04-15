"use strict";

(function setupLegacySharedActionDefinitions(global) {
    let cachedDefinitions = null;

    global.IdleLoopsLegacyDefinitionFactories = Object.freeze({
        registerSharedActionFactories({MultipartAction}) {
            if (cachedDefinitions) {
                return cachedDefinitions;
            }

            class AssassinAction extends MultipartAction {
                constructor(name, extras) {
                    // @ts-ignore
                    super(name, {
                        ...extras,
                        ...AssassinAction.$defaults,
                    });
                }

                get imageName() {
                    return "assassin";
                }

                getStoryTexts(rawStoriesDataForAction = _txtsObj(this.name.toLowerCase().replace(/ /gu, "_"))[0].children) {
                    return super.getStoryTexts(rawStoriesDataForAction);
                }

                static $defaults = /** @type {const} */({
                    type: "multipart",
                    expMult: 1,
                    stats: {Per: 0.2, Int: 0.1, Dex: 0.3, Luck: 0.2, Spd: 0.2},
                    loopStats: ["Per", "Int", "Dex", "Luck", "Spd"],
                });

                manaCost() { return 50000; }
                allowed() { return 1; }
                canStart(loopCounter = towns[this.townNum][`${this.varName}LoopCounter`]) { return loopCounter === 0; }
                loopCost(_segment) { return 50000000; }
                tickProgress(_offset, _loopCounter, totalCompletions = towns[this.townNum][`total${this.varName}`]) {
                    const baseSkill = Math.sqrt(getSkillLevel("Practical")) + getSkillLevel("Thievery") + getSkillLevel("Assassin");
                    const loopStat = 1 / 10;
                    const completions = Math.sqrt(1 + totalCompletions / 100);
                    const reputationPenalty = resources.reputation !== 0 ? Math.abs(resources.reputation) : 1;
                    const killStreak = resources.heart > 0 ? resources.heart : 1;
                    return baseSkill * loopStat * completions / reputationPenalty / killStreak;
                }
                getPartName() {
                    return "Assassination";
                }
                loopsFinished() {
                    addResource("heart", 1);
                    hearts.push(this.varName);
                }
                finish() {
                    const rep = Math.min((this.townNum + 1) * -250 + getSkillLevel("Assassin"), 0);
                    addResource("reputation", rep);
                }
                visible() { return getSkillLevel("Assassin") > 0; }
                unlocked() { return getSkillLevel("Assassin") > 0; }
                storyReqs(storyNum) {
                    switch (storyNum) {
                        case 1:
                            return towns[this.townNum][`totalAssassinZ${this.townNum}`] >= 1;
                    }
                    return false;
                }
            }

            function SurveyAction(townNum) {
                return /** @type {const} */ ({
                    type: "progress",
                    expMult: 1,
                    townNum,
                    stats: {
                        Per: 0.4,
                        Spd: 0.2,
                        Con: 0.2,
                        Luck: 0.2,
                    },
                    canStart() {
                        return (resources.map > 0) || towns[this.townNum].getLevel("Survey") === 100;
                    },
                    manaCost() {
                        return 10000 * (this.townNum + 1);
                    },
                    visible() {
                        return getExploreProgress() > 0;
                    },
                    unlocked() {
                        return getExploreProgress() > 0;
                    },
                    finish() {
                        if (towns[this.townNum].getLevel("Survey") !== 100) {
                            addResource("map", -1);
                            addResource("completedMap", 1);
                            towns[this.townNum].finishProgress(this.varName, getExploreSkill());
                            view.requestUpdate("updateActionTooltips", null);
                        } else if (options.pauseOnComplete) {
                            pauseGame(true, _txt("actions>tooltip>survey_complete_paused"));
                        }
                    },
                });
            }

            function adjustRocks(townNum) {
                const town = towns[townNum];
                const baseStones = town.getLevel(`RuinsZ${townNum}`) * 2500;
                const usedStones = stonesUsed[townNum];
                town[`totalStonesZ${townNum}`] = baseStones;
                town[`goodStonesZ${townNum}`] = Math.floor(town[`checkedStonesZ${townNum}`] / 1000) - usedStones;
                town[`goodTempStonesZ${townNum}`] = Math.floor(town[`checkedStonesZ${townNum}`] / 1000) - usedStones;
                if (usedStones === 250) town[`checkedStonesZ${townNum}`] = 250000;
            }

            function adjustAllRocks() {
                adjustRocks(1);
                adjustRocks(3);
                adjustRocks(5);
                adjustRocks(6);
            }

            function RuinsAction(townNum) {
                return /** @type {const} */ ({
                    type: "progress",
                    expMult: 1,
                    townNum,
                    stats: {
                        Per: 0.4,
                        Spd: 0.2,
                        Con: 0.2,
                        Luck: 0.2,
                    },
                    manaCost() {
                        return 100000;
                    },
                    affectedBy: ["SurveyZ1"],
                    visible() {
                        return towns[this.townNum].getLevel("Survey") >= 100;
                    },
                    unlocked() {
                        return towns[this.townNum].getLevel("Survey") >= 100;
                    },
                    finish() {
                        towns[this.townNum].finishProgress(this.varName, 1);
                        adjustRocks(this.townNum);
                    },
                    storyReqs(storyNum) {
                        switch (storyNum) {
                            case 1:
                                return towns[this.townNum].getLevel(this.varName) >= 10;
                            case 2:
                                return towns[this.townNum].getLevel(this.varName) >= 50;
                            case 3:
                                return towns[this.townNum].getLevel(this.varName) >= 100;
                        }
                        return false;
                    },
                });
            }

            function HaulAction(townNum) {
                return /** @type {const} */ ({
                    type: "limited",
                    expMult: 1,
                    townNum,
                    varName: `StonesZ${townNum}`,
                    stats: {
                        Str: 0.4,
                        Con: 0.6,
                    },
                    affectedBy: ["SurveyZ1"],
                    canStart() {
                        return !resources.stone && stonesUsed[this.townNum] < 250;
                    },
                    manaCost() {
                        return 50000;
                    },
                    visible() {
                        return towns[this.townNum].getLevel(`RuinsZ${townNum}`) > 0;
                    },
                    unlocked() {
                        return towns[this.townNum].getLevel(`RuinsZ${townNum}`) > 0;
                    },
                    finish() {
                        stoneLoc = this.townNum;
                        towns[this.townNum].finishRegular(this.varName, 1000, () => {
                            addResource("stone", true);
                        });
                    },
                    storyReqs(storyNum) {
                        switch (storyNum) {
                            case 1:
                                return towns[this.townNum][`good${this.varName}`] + stonesUsed[this.townNum] >= 1;
                            case 2:
                                return towns[this.townNum][`good${this.varName}`] + stonesUsed[this.townNum] >= 100;
                            case 3:
                                return towns[this.townNum][`good${this.varName}`] + stonesUsed[this.townNum] >= 250;
                        }
                        return false;
                    },
                });
            }

            cachedDefinitions = Object.freeze({
                AssassinAction,
                SurveyAction,
                RuinsAction,
                HaulAction,
                adjustRocks,
                adjustAllRocks,
            });

            global.adjustRocks = adjustRocks;
            global.adjustAllRocks = adjustAllRocks;
            return cachedDefinitions;
        },
    });
})(globalThis);
