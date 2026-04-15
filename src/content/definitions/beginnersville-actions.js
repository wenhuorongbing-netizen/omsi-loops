"use strict";

(function setupBeginnersvilleActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerBeginnersvilleActions = function registerBeginnersvilleActions({Action, MultipartAction, DungeonAction, lateGameActions}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

        Action.Map = new Action("Map", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getExploreProgress() > 1;
                }
                return false;
            },
            stats: {
                Cha: 0.8,
                Luck: 0.1,
                Soul: 0.1
            },
            manaCost() {
                return 200;
            },
            canStart() {
                return resources.gold >= 15;
            },
            visible() {
                return getExploreProgress() > 0;
            },
            unlocked() {
                return getExploreProgress() > 0;
            },
            goldCost() {
                return 15;
            },
            finish() {
                addResource("gold", -this.goldCost());
                addResource("map", 1);
            },
        });
        lateGameActions.push("Map");
        
        Action.Wander = new Action("Wander", {
            type: "progress",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0].getLevel(this.varName) >= 20;
                    case 2:
                        return towns[0].getLevel(this.varName) >= 40;
                    case 3:
                        return towns[0].getLevel(this.varName) >= 60;
                    case 4:
                        return towns[0].getLevel(this.varName) >= 80;
                    case 5:
                        return towns[0].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.2,
                Con: 0.2,
                Cha: 0.2,
                Spd: 0.3,
                Luck: 0.1
            },
            affectedBy: ["Buy Glasses"],
            manaCost() {
                return 250;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            finish() {
                towns[0].finishProgress(this.varName, 200 * (resources.glasses ? 4 : 1));
            }
        });
        function adjustPots() {
            let town = towns[0];
            let basePots = Math.round(town.getLevel("Wander") * 5 * adjustContentFromPrestige());
            town.totalPots = Math.floor(basePots + basePots * getSurveyBonus(town));
        }
        function adjustLocks() {
            let town = towns[0];
            let baseLocks = Math.round(town.getLevel("Wander") * adjustContentFromPrestige());
            town.totalLocks = Math.floor(baseLocks * getSkillMod("Spatiomancy", 100, 300, .5) + baseLocks * getSurveyBonus(town));
        }
        
        Action.SmashPots = new Action("Smash Pots", {
            type: "limited",
            expMult: 1,
            townNum: 0,
            varName: "Pots",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0][`good${this.varName}`] >= 50;
                    case 2:
                        return towns[0][`good${this.varName}`] >= 75;
                }
                return false;
            },
            stats: {
                Str: 0.2,
                Per: 0.2,
                Spd: 0.6
            },
            manaCost() {
                return Math.ceil(50 * getSkillBonus("Practical"));
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            // note this name is misleading: it is used for mana and gold gain.
            goldCost() {
                return Math.floor(100 * getSkillBonus("Dark"));
            },
            finish() {
                towns[0].finishRegular(this.varName, 10, () => {
                    const manaGain = this.goldCost();
                    addMana(manaGain);
                    return manaGain;
                });
            }
        });
        
        Action.PickLocks = new Action("Pick Locks", {
            type: "limited",
            varName: "Locks",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[0][`checked${this.varName}`] >= 50;
                    case 3:
                        return towns[0][`good${this.varName}`] >= 10;
                    case 4:
                        return towns[0][`good${this.varName}`] >= 25;
                }
                return false;
            },
            stats: {
                Dex: 0.5,
                Per: 0.3,
                Spd: 0.1,
                Luck: 0.1
            },
            manaCost() {
                return 400;
            },
            visible() {
                return towns[0].getLevel("Wander") >= 3;
            },
            unlocked() {
                return towns[0].getLevel("Wander") >= 20;
            },
            goldCost() {
                let base = 10;
                return Math.floor(base * getSkillMod("Practical",0,200,1) * getSkillBonus("Thievery"));
            },
            finish() {
                towns[0].finishRegular(this.varName, 10, () => {
                    const goldGain = this.goldCost();
                    addResource("gold", goldGain);
                    return goldGain;
                });
            }
        });
        
        Action.BuyGlasses = new Action("Buy Glasses", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.glassesBought;
                    case 2:
                        return getExploreProgress() >= 100;
                }
                return false;
            },
            stats: {
                Cha: 0.7,
                Spd: 0.3
            },
            allowed() {
                return 1;
            },
            canStart() {
                return resources.gold >= 10;
            },
            cost() {
                addResource("gold", -10);
            },
            manaCost() {
                return 50;
            },
            visible() {
                return towns[0].getLevel("Wander") >= 3 && getExploreProgress() < 100 && !prestigeValues["completedAnyPrestige"];
            },
            unlocked() {
                return towns[0].getLevel("Wander") >= 20;
            },
            finish() {
                addResource("glasses", true);
            },
            story(completed) {
                setStoryFlag("glassesBought");
            }
        });
        
        Action.FoundGlasses = new Action("Found Glasses", {
            type: "normal",
            expMult: 0,
            townNum: 0,
            stats: {
            },
            affectedBy: ["SurveyZ1"],
            allowed() {
                return 0;
            },
            canStart() {
                return false;
            },
            manaCost() {
                return 0;
            },
            visible() {
                return getExploreProgress() >= 100 || prestigeValues["completedAnyPrestige"];
            },
            unlocked() {
                return false;
            },
            finish() {
            }
        });
        
        Action.BuyManaZ1 = new Action("Buy Mana Z1", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        //Strange unlock condition; this story unlocks after meeting
                        //people, rather than when you buy from here?
                        return towns[0].getLevel("Met") > 0;
                }
                return false;
            },
            stats: {
                Cha: 0.7,
                Int: 0.2,
                Luck: 0.1
            },
            manaCost() {
                return 100;
            },
            visible() {
                return towns[0].getLevel("Wander") >= 3;
            },
            unlocked() {
                return towns[0].getLevel("Wander") >= 20;
            },
            goldCost() {
                return Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige());
            },
            finish() {
                addMana(resources.gold * this.goldCost());
                resetResource("gold");
            },
        });
        
        Action.MeetPeople = new Action("Meet People", {
            type: "progress",
            expMult: 1,
            townNum: 0,
            varName: "Met",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[0].getLevel(this.varName) >= 20;
                    case 3:
                        return towns[0].getLevel(this.varName) >= 40;
                    case 4:
                        return towns[0].getLevel(this.varName) >= 60;
                    case 5:
                        return towns[0].getLevel(this.varName) >= 80;
                    case 6:
                        return towns[0].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Int: 0.1,
                Cha: 0.8,
                Soul: 0.1
            },
            manaCost() {
                return 800;
            },
            visible() {
                return towns[0].getLevel("Wander") >= 10;
            },
            unlocked() {
                return towns[0].getLevel("Wander") >= 22;
            },
            finish() {
                towns[0].finishProgress(this.varName, 200);
            },
        });
        function adjustSQuests() {
            let town = towns[0];
            let baseSQuests = Math.round(town.getLevel("Met") * adjustContentFromPrestige());
            town.totalSQuests = Math.floor(baseSQuests * getSkillMod("Spatiomancy", 200, 400, .5) + baseSQuests * getSurveyBonus(town));
        }
        
        Action.TrainStrength = new Action("Train Strength", {
            type: "normal",
            expMult: 4,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.strengthTrained;
                    case 2: return storyFlags.strengthTrained && getTalent("Str") >= 100;
                    case 3: return storyFlags.strengthTrained && getTalent("Str") >= 1000;
                    case 4: return storyFlags.strengthTrained && getTalent("Str") >= 10000;
                    case 5: return storyFlags.strengthTrained && getTalent("Str") >= 100000;
                }
                return false;
            },
            stats: {
                Str: 0.8,
                Con: 0.2
            },
            allowed() {
                return trainingLimits;
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[0].getLevel("Met") >= 1;
            },
            unlocked() {
                return towns[0].getLevel("Met") >= 5;
            },
            finish() {
        
            },
            story(completed) {
                setStoryFlag("strengthTrained");
            }
        });
        
        Action.ShortQuest = new Action("Short Quest", {
            type: "limited",
            expMult: 1,
            townNum: 0,
            varName: "SQuests",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0][`checked${this.varName}`] >= 1;
                    case 2:
                        // 20 short quests in a loop
                        return storyFlags.maxSQuestsInALoop;
                    case 3:
                        // 50 short quests in a loop
                        return storyFlags.realMaxSQuestsInALoop;
                }
                return false;
            },
            stats: {
                Str: 0.2,
                Dex: 0.1,
                Cha: 0.3,
                Spd: 0.2,
                Luck: 0.1,
                Soul: 0.1
            },
            manaCost() {
                return 600;
            },
            visible() {
                return towns[0].getLevel("Met") >= 1;
            },
            unlocked() {
                return towns[0].getLevel("Met") >= 5;
            },
            goldCost() {
                let base = 20;
                return Math.floor(base * getSkillMod("Practical",100,300,1));
            },
            finish() {
                towns[0].finishRegular(this.varName, 5, () => {
                    const goldGain = this.goldCost();
                    addResource("gold", goldGain);
                    return goldGain;
                });
            },
            story(completed) {
                if (towns[0][`good${this.varName}`] >= 20 && towns[0][`goodTemp${this.varName}`] <= towns[0][`good${this.varName}`] - 20) setStoryFlag("maxSQuestsInALoop");
                if (towns[0][`good${this.varName}`] >= 50 && towns[0][`goodTemp${this.varName}`] <= towns[0][`good${this.varName}`] - 50) setStoryFlag("realMaxSQuestsInALoop");
            }
        });
        
        Action.Investigate = new Action("Investigate", {
            type: "progress",
            expMult: 1,
            townNum: 0,
            varName: "Secrets",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0].getLevel(this.varName) >= 20;
                    case 2:
                        return towns[0].getLevel(this.varName) >= 40;
                    case 3:
                        return towns[0].getLevel(this.varName) >= 60;
                    case 4:
                        return towns[0].getLevel(this.varName) >= 80;
                    case 5:
                        return towns[0].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.3,
                Cha: 0.4,
                Spd: 0.2,
                Luck: 0.1
            },
            manaCost() {
                return 1000;
            },
            visible() {
                return towns[0].getLevel("Met") >= 5;
            },
            unlocked() {
                return towns[0].getLevel("Met") >= 25;
            },
            finish() {
                towns[0].finishProgress(this.varName, 500);
            },
        });
        function adjustLQuests() {
            let town = towns[0];
            let baseLQuests = Math.round(town.getLevel("Secrets") / 2 * adjustContentFromPrestige());
            town.totalLQuests = Math.floor(baseLQuests * getSkillMod("Spatiomancy", 300, 500, .5) + baseLQuests * getSurveyBonus(town));
        }
        
        Action.LongQuest = new Action("Long Quest", {
            type: "limited",
            expMult: 1,
            townNum: 0,
            varName: "LQuests",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0][`checked${this.varName}`] >= 1;
                    case 2:
                        // 10 long quests in a loop
                        return storyFlags.maxLQuestsInALoop;
                    case 3:
                        // 25 long quests in a loop
                        return storyFlags.realMaxLQuestsInALoop;
                }
                return false;
            },
            stats: {
                Str: 0.2,
                Int: 0.2,
                Con: 0.4,
                Spd: 0.2
            },
            manaCost() {
                return 1500;
            },
            visible() {
                return towns[0].getLevel("Secrets") >= 1;
            },
            unlocked() {
                return towns[0].getLevel("Secrets") >= 10;
            },
            goldCost() {
                let base = 30;
                return Math.floor(base * getSkillMod("Practical",200,400,1));
            },
            finish() {
                towns[0].finishRegular(this.varName, 5, () => {
                    addResource("reputation", 1);
                    const goldGain = this.goldCost();
                    addResource("gold", goldGain);
                    return goldGain;
                });
            },
            story(completed) {
                if (towns[0][`good${this.varName}`] >= 10 && towns[0][`goodTemp${this.varName}`] <= towns[0][`good${this.varName}`] - 10) setStoryFlag("maxLQuestsInALoop");
                if (towns[0][`good${this.varName}`] >= 25 && towns[0][`goodTemp${this.varName}`] <= towns[0][`good${this.varName}`] - 25) setStoryFlag("realMaxLQuestsInALoop");
            }
        });
        
        Action.ThrowParty = new Action("Throw Party", {
            type: "normal",
            expMult: 2,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.partyThrown;
                    case 2:
                        return storyFlags.partyThrown2;
                }
                return false;
            },
            stats: {
                Cha: 0.8,
                Soul: 0.2
            },
            manaCost() {
                return 1600;
            },
            canStart() {
                return resources.reputation >= 2;
            },
            cost() {
                addResource("reputation", -2);
            },
            visible() {
                return towns[this.townNum].getLevel("Secrets") >= 20;
            },
            unlocked() {
                return towns[this.townNum].getLevel("Secrets") >= 30;
            },
            finish() {
                towns[0].finishProgress("Met", 3200);
            },
            story(completed) {
                setStoryFlag("partyThrown");
                if (completed >= 10) setStoryFlag("partyThrown2");
            }
        });
        
        Action.WarriorLessons = new Action("Warrior Lessons", {
            type: "normal",
            expMult: 1.5,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Combat") >= 1;
                    case 2:
                        return getSkillLevel("Combat") >= 100;
                    case 3:
                        return getSkillLevel("Combat") >= 200;
                    case 4:
                        return getSkillLevel("Combat") >= 250;
                    case 5:
                        return getSkillLevel("Combat") >= 500;
                    case 6:
                        return getSkillLevel("Combat") >= 1000;
                }
                return false;
            },
            stats: {
                Str: 0.5,
                Dex: 0.3,
                Con: 0.2
            },
            skills: {
                Combat: 100
            },
            manaCost() {
                return 1000;
            },
            canStart() {
                return resources.reputation >= 2;
            },
            visible() {
                return towns[0].getLevel("Secrets") >= 10;
            },
            unlocked() {
                return towns[0].getLevel("Secrets") >= 20;
            },
            finish() {
                handleSkillExp(this.skills);
            },
        });
        
        Action.MageLessons = new Action("Mage Lessons", {
            type: "normal",
            expMult: 1.5,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Magic") >= 1;
                    case 2:
                        return getSkillLevel("Magic") >= 100;
                    case 3:
                        return getSkillLevel("Magic") >= 200;
                    case 4:
                        return getSkillLevel("Magic") >= 250;
                    case 5:
                        return getSkillLevel("Alchemy") >= 10;
                    case 6:
                        return getSkillLevel("Alchemy") >= 50;
                    case 7:
                        return getSkillLevel("Alchemy") >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.3,
                Int: 0.5,
                Con: 0.2
            },
            skills: {
                Magic() {
                    return 100 * (1 + getSkillLevel("Alchemy") / 100);
                }
            },
            manaCost() {
                return 1000;
            },
            canStart() {
                return resources.reputation >= 2;
            },
            visible() {
                return towns[0].getLevel("Secrets") >= 10;
            },
            unlocked() {
                return towns[0].getLevel("Secrets") >= 20;
            },
            finish() {
                handleSkillExp(this.skills);
            },
        });
        
        Action.HealTheSick = new MultipartAction("Heal The Sick", {
            type: "multipart",
            expMult: 1,
            townNum: 0,
            varName: "Heal",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0].totalHeal >= 1;
                    case 2:
                        // 10 patients healed in a loop
                        return storyFlags.heal10PatientsInALoop;
                    case 3:
                        return towns[0].totalHeal >= 100;
                    case 4:
                        return towns[0].totalHeal >= 1000;
                    case 5:
                        // fail reputation req
                        return storyFlags.failedHeal;
                    case 6:
                        return getSkillLevel("Restoration") >= 50;
                }
                return false;
            },
            stats: {
                Per: 0.2,
                Int: 0.2,
                Cha: 0.2,
                Soul: 0.4
            },
            skills: {
                Magic: 10
            },
            loopStats: ["Per", "Int", "Cha"],
            manaCost() {
                return 2500;
            },
            canStart() {
                return resources.reputation >= 1;
            },
            loopCost(segment, loopCounter = towns[0].HealLoopCounter) {
                return fibonacci(2 + Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 5000;
            },
            tickProgress(_offset, _loopCounter, totalCompletions = towns[0].totalHeal) {
                return getSkillLevel("Magic") * Math.max(getSkillLevel("Restoration") / 50, 1) * Math.sqrt(1 + totalCompletions / 100);
            },
            loopsFinished() {
                addResource("reputation", 3);
            },
            getPartName(loopCounter = towns[0].HealLoopCounter) {
                return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${numberToWords(Math.floor((loopCounter + 0.0001) / this.segments + 1))}`;
            },
            visible() {
                return towns[0].getLevel("Secrets") >= 20;
            },
            unlocked() {
                return getSkillLevel("Magic") >= 12;
            },
            finish() {
                handleSkillExp(this.skills);
            },
            story(completed) {
                if (towns[0].HealLoopCounter / 3 + 1 >= 10) setStoryFlag("heal10PatientsInALoop");
            }
        });
        
        Action.FightMonsters = new MultipartAction("Fight Monsters", {
            type: "multipart",
            expMult: 1,
            townNum: 0,
            varName: "Fight",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[0].totalFight >= 1;
                    case 2:
                        return towns[0].totalFight >= 100;
                    case 3:
                        return towns[0].totalFight >= 500;
                    case 4:
                        return towns[0].totalFight >= 1000;
                    case 5:
                        return towns[0].totalFight >= 5000;
                    case 6:
                        return towns[0].totalFight >= 10000;
                    case 7:
                        return towns[0].totalFight >= 20000;
                }
                return false;
            },
            stats: {
                Str: 0.3,
                Spd: 0.3,
                Con: 0.3,
                Luck: 0.1
            },
            skills: {
                Combat: 10
            },
            loopStats: ["Spd", "Spd", "Spd", "Str", "Str", "Str", "Con", "Con", "Con"],
            manaCost() {
                return 2000;
            },
            canStart() {
                return resources.reputation >= 2;
            },
            loopCost(segment, loopCounter = towns[0].FightLoopCounter) {
                return fibonacci(Math.floor((loopCounter + segment) - loopCounter / 3 + 0.0000001)) * 10000;
            },
            tickProgress(_offset, _loopCounter, totalCompletions = towns[0].totalFight) {
                return getSelfCombat() * Math.sqrt(1 + totalCompletions / 100);
            },
            loopsFinished() {
                // empty
            },
            segmentFinished() {
                addResource("gold", 20);
            },
            getPartName(loopCounter = towns[0].FightLoopCounter) {
                const monster = Math.floor(loopCounter / 3 + 0.0000001);
                if (monster >= this.segmentNames.length) return this.altSegmentNames[monster % 3];
                return this.segmentNames[monster];
            },
            getSegmentName(segment) {
                return `${this.segmentModifiers[segment % 3]} ${this.getPartName()}`;
            },
            visible() {
                return towns[0].getLevel("Secrets") >= 20;
            },
            unlocked() {
                return getSkillLevel("Combat") >= 10;
            },
            finish() {
                handleSkillExp(this.skills);
            },
        });
        
        Action.SmallDungeon = new DungeonAction("Small Dungeon", 0, {
            type: "multipart",
            expMult: 1,
            townNum: 0,
            varName: "SDungeon",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.smallDungeonAttempted;
                    case 2:
                        return towns[0][`total${this.varName}`] >= 1000;
                    case 3:
                        return towns[0][`total${this.varName}`] >= 5000;
                    case 4:
                        return towns[0][`total${this.varName}`] >= 10000;
                    case 5:
                        return storyFlags.clearSDungeon;
                }
                return false;
            },
            stats: {
                Str: 0.1,
                Dex: 0.4,
                Con: 0.3,
                Cha: 0.1,
                Luck: 0.1
            },
            skills: {
                Combat: 5,
                Magic: 5
            },
            loopStats: ["Dex", "Con", "Dex", "Cha", "Dex", "Str", "Luck"],
            manaCost() {
                return 2000;
            },
            canStart(loopCounter = towns[this.townNum].SDungeonLoopCounter) {
                const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001);
                return resources.reputation >= 2 && curFloor < dungeons[this.dungeonNum].length;
            },
            loopCost(segment, loopCounter = towns[this.townNum].SDungeonLoopCounter) {
                return precision3(Math.pow(2, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 15000);
            },
            tickProgress(offset, loopCounter = towns[this.townNum].SDungeonLoopCounter) {
                const floor = Math.floor((loopCounter) / this.segments + 0.0000001);
                return (getSelfCombat() + getSkillLevel("Magic")) *
                    Math.sqrt(1 + dungeons[this.dungeonNum][floor].completed / 200);
            },
            loopsFinished() {
                const curFloor = Math.floor((towns[this.townNum].SDungeonLoopCounter) / this.segments + 0.0000001 - 1);
                const success = this.finishDungeon(curFloor);
                if (success === true && storyMax <= 1) {
                    unlockGlobalStory(1);
                } else if (success === false && storyMax <= 2) {
                    unlockGlobalStory(2);
                }
            },
            visible() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
            },
            unlocked() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
            },
            finish() {
                handleSkillExp(this.skills);
            },
            story(completed) {
                setStoryFlag("smallDungeonAttempted");
                if (towns[this.townNum][this.varName + "LoopCounter"] >= 42) setStoryFlag("clearSDungeon");
            },
        });
        DungeonAction.prototype.finishDungeon = function finishDungeon(floorNum) {
            const dungeonNum = this.dungeonNum;
            const floor = dungeons[dungeonNum][floorNum];
            if (!floor) {
                return false;
            }
            floor.completed++;
            const rand = Math.random();
            if (rand <= floor.ssChance) {
                const statToAdd = statList[Math.floor(Math.random() * statList.length)];
                floor.lastStat = statToAdd;
                const countToAdd = Math.floor(Math.pow(10, dungeonNum) * getSkillBonus("Divine"));
                globalThis.IdleLoopsCharacterState.addSoulstonesToStat(stats, statToAdd, countToAdd);
                floor.ssChance *= 0.98;
                view.requestUpdate("updateSoulstones",null);
                actionLog.addSoulstones(this, statToAdd, countToAdd);
                return true;
            }
            return false;
        }
        
        Action.BuySupplies = new Action("Buy Supplies", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.suppliesBought;
                    case 2:
                        return storyFlags.suppliesBoughtWithoutHaggling;
                }
                return false;
            },
            stats: {
                Cha: 0.8,
                Luck: 0.1,
                Soul: 0.1
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 200;
            },
            canStart() {
                return resources.gold >= towns[0].suppliesCost && !resources.supplies;
            },
            cost() {
                addResource("gold", -towns[0].suppliesCost);
            },
            visible() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
            },
            unlocked() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
            },
            finish() {
                addResource("supplies", true);
            },
            story(completed) {
                setStoryFlag("suppliesBought");
                if (towns[0].suppliesCost === 300) setStoryFlag("suppliesBoughtWithoutHaggling");
            }
        });
        
        Action.Haggle = new Action("Haggle", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.haggle;
                    case 2:
                        return storyFlags.haggle15TimesInALoop;
                    case 3:
                        return storyFlags.haggle16TimesInALoop;
                }
                return false;
            },
            stats: {
                Cha: 0.8,
                Luck: 0.1,
                Soul: 0.1
            },
            manaCost() {
                return 100;
            },
            canStart() {
                return resources.reputation >= 1;
            },
            cost() {
                addResource("reputation", -1);
            },
            visible() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
            },
            unlocked() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
            },
            finish() {
                towns[0].suppliesCost -= 20;
                if (towns[0].suppliesCost < 0) {
                    towns[0].suppliesCost = 0;
                }
                view.requestUpdate("updateResource", "supplies");
            },
            story(completed) {
                if (completed >= 15) setStoryFlag("haggle15TimesInALoop");
                if (completed >= 16) setStoryFlag("haggle16TimesInALoop");
                setStoryFlag("haggle");
            }
        });
        
        Action.StartJourney = new Action("Start Journey", {
            type: "normal",
            expMult: 2,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return townsUnlocked.includes(1);
                }
                return false;
            },
            stats: {
                Con: 0.4,
                Per: 0.3,
                Spd: 0.3
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 1000;
            },
            canStart() {
                return resources.supplies;
            },
            cost() {
                addResource("supplies", false);
            },
            visible() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
            },
            unlocked() {
                return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
            },
            finish() {
                unlockTown(1);
            },
            story(completed) {
                unlockGlobalStory(3);
            }
        });
        
        Action.HitchRide = new Action("Hitch Ride", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getExploreProgress() >= 25;
                }
                return false;
            },
            stats: {
                Cha: 0.5,
        		Per: 0.5
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 1;
            },
            canStart() {
                return true;
            },
            visible() {
                return getExploreProgress() > 1;
            },
            unlocked() {
                return getExploreProgress() >= 25;
            },
            finish() {
                unlockTown(2);
            },
        });
        
        Action.OpenRift = new Action("Open Rift", {
            type: "normal",
            expMult: 1,
            townNum: 0,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[5].getLevel("Meander") >= 1;
                }
                return false;
            },
            stats: {
                Int: 0.2,
                Luck: 0.1,
                Soul: 0.7
            },
            skills: {
                Dark: 1000
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 50000;
            },
            visible() {
                return towns[5].getLevel("Meander") >= 1;
            },
            unlocked() {
                return getSkillLevel("Dark") >= 300 && getSkillLevel("Spatiomancy") >= 100;
            },
            finish() {
                handleSkillExp(this.skills);
                addResource("supplies", false);
                unlockTown(5);
            },
        });

        cachedDefinitions = Object.freeze({
            adjustPots,
            adjustLocks,
            adjustSQuests,
            adjustLQuests,
        });

        global.adjustPots = adjustPots;
        global.adjustLocks = adjustLocks;
        global.adjustSQuests = adjustSQuests;
        global.adjustLQuests = adjustLQuests;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerBeginnersvilleActions,
    });
})(globalThis);