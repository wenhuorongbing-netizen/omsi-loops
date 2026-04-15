"use strict";

(function setupOlympusActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerOlympusActions = function registerOlympusActions({Action, MultipartAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

        
        Action.ClimbMountain = new Action("Climb Mountain", {
            type: "progress",
            expMult: 1,
            townNum: 3,
            varName: "Mountain",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[3].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[3].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[3].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[3].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[3].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[3].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.1,
                Str: 0.2,
                Con: 0.4,
                Per: 0.2,
                Spd: 0.1
            },
            affectedBy: ["Buy Pickaxe"],
            manaCost() {
                return 800;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            finish() {
                towns[3].finishProgress(this.varName, 100 * (resources.pickaxe ? 2 : 1));
            },
        });
        
        Action.ManaGeyser = new Action("Mana Geyser", {
            type: "limited",
            expMult: 1,
            townNum: 3,
            varName: "Geysers",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3][`good${this.varName}`] >= 1;
                    case 2:
                        return towns[3][`good${this.varName}`] >= 10;
                    case 3:
                        return towns[3][`good${this.varName}`] >= 15;
                }
                return false;
            },
            stats: {
                Str: 0.6,
                Per: 0.3,
                Int: 0.1,
            },
            affectedBy: ["Buy Pickaxe"],
            manaCost() {
                return Math.ceil(2000 * getSkillBonus("Spatiomancy"));
            },
            canStart() {
                return resources.pickaxe;
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[3].getLevel("Mountain") >= 2;
            },
            finish() {
                towns[3].finishRegular(this.varName, 100, () => {
                    addMana(5000);
                    return 5000;
                });
            },
        });
        function adjustGeysers() {
            let town = towns[3];
            let baseGeysers = Math.round(town.getLevel("Mountain") * 10 * adjustContentFromPrestige());
            town.totalGeysers = Math.round(baseGeysers + baseGeysers * getSurveyBonus(town));
        }
        
        Action.DecipherRunes = new Action("Decipher Runes", {
            type: "progress",
            expMult: 1,
            townNum: 3,
            varName: "Runes",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[3].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[3].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[3].getLevel(this.varName) >= 30;
                    case 5:
                        return towns[3].getLevel(this.varName) >= 40;
                    case 6:
                        return towns[3].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[3].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[3].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.3,
                Int: 0.7
            },
            affectedBy: ["Buy Glasses"],
            manaCost() {
                return 1200;
            },
            visible() {
                return towns[3].getLevel("Mountain") >= 2;
            },
            unlocked() {
                return towns[3].getLevel("Mountain") >= 20;
            },
            finish() {
                towns[3].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
                view.requestUpdate("adjustManaCost", "Chronomancy");
                view.requestUpdate("adjustManaCost", "Pyromancy");
            },
        });
        
        Action.Chronomancy = new Action("Chronomancy", {
            type: "normal",
            expMult: 2,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Chronomancy") >= 1;
                    case 2:
                        return getSkillLevel("Chronomancy") >= 50;
                    case 3:
                        return getSkillLevel("Chronomancy") >= 100;
                    case 4:
                        return getSkillLevel("Chronomancy") >= 1000;
                }
                return false;
            },
            stats: {
                Soul: 0.1,
                Spd: 0.3,
                Int: 0.6
            },
            skills: {
                Chronomancy: 100
            },
            manaCost() {
                return Math.ceil(10000 * (1 - towns[3].getLevel("Runes") * 0.005));
            },
            visible() {
                return towns[3].getLevel("Runes") >= 8;
            },
            unlocked() {
                return towns[3].getLevel("Runes") >= 30 && getSkillLevel("Magic") >= 150;
            },
            finish() {
                handleSkillExp(this.skills);
            },
        });
        
        Action.LoopingPotion = new Action("Looping Potion", {
            type: "normal",
            expMult: 2,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.loopingPotionMade;
                }
                return false;
            },
            stats: {
                Dex: 0.2,
                Int: 0.7,
                Soul: 0.1,
            },
            skills: {
                Alchemy: 100
            },
            canStart() {
                return resources.herbs >= 400;
            },
            cost() {
                addResource("herbs", -400);
            },
            manaCost() {
                return Math.ceil(30000);
            },
            visible() {
                return getSkillLevel("Spatiomancy") >= 1;
            },
            unlocked() {
                return getSkillLevel("Alchemy") >= 200;
            },
            finish() {
                addResource("loopingPotion", true);
                handleSkillExp(this.skills);
            },
            story(completed) {
                setStoryFlag("loopingPotionMade");
                unlockGlobalStory(9);
            }
        });
        
        Action.Pyromancy = new Action("Pyromancy", {
            type: "normal",
            expMult: 2,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Pyromancy") >= 1;
                    case 2:
                        return getSkillLevel("Pyromancy") >= 50;
                    case 3:
                        return getSkillLevel("Pyromancy") >= 100;
                    case 4:
                        return getSkillLevel("Pyromancy") >= 500;
                    case 5:
                        return getSkillLevel("Pyromancy") >= 1000;
                }
                return false;
            },
            stats: {
                Per: 0.2,
                Int: 0.7,
                Soul: 0.1
            },
            skills: {
                Pyromancy: 100
            },
            manaCost() {
                return Math.ceil(14000 * (1 - towns[3].getLevel("Runes") * 0.005));
            },
            visible() {
                return towns[3].getLevel("Runes") >= 16;
            },
            unlocked() {
                return towns[3].getLevel("Runes") >= 60 && getSkillLevel("Magic") >= 200;
            },
            finish() {
                handleSkillExp(this.skills);
            },
        });
        
        Action.ExploreCavern = new Action("Explore Cavern", {
            type: "progress",
            expMult: 1,
            townNum: 3,
            varName: "Cavern",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[3].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[3].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[3].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[3].getLevel(this.varName) >= 50;
                    case 6:
                        return towns[3].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[3].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[3].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.1,
                Str: 0.3,
                Con: 0.2,
                Per: 0.3,
                Spd: 0.1
            },
            manaCost() {
                return 1500;
            },
            visible() {
                return towns[3].getLevel("Mountain") >= 10;
            },
            unlocked() {
                return towns[3].getLevel("Mountain") >= 40;
            },
            finish() {
                towns[3].finishProgress(this.varName, 100);
            },
        });
        
        Action.MineSoulstones = new Action("Mine Soulstones", {
            type: "limited",
            expMult: 1,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[3][`good${this.varName}`] >= 1;
                    case 3:
                        return towns[3][`good${this.varName}`] >= 30;
                    case 4:
                        return towns[3][`good${this.varName}`] >= 75;
                }
                return false;
            },
            stats: {
                Str: 0.6,
                Dex: 0.1,
                Con: 0.3,
            },
            affectedBy: ["Buy Pickaxe"],
            manaCost() {
                return 5000;
            },
            canStart() {
                return resources.pickaxe;
            },
            visible() {
                return towns[3].getLevel("Cavern") >= 2;
            },
            unlocked() {
                return towns[3].getLevel("Cavern") >= 20;
            },
            finish() {
                towns[3].finishRegular(this.varName, 10, () => {
                    const statToAdd = statList[Math.floor(Math.random() * statList.length)];
                    const countToAdd = Math.floor(getSkillBonus("Divine"));
                    stats[statToAdd].soulstone += countToAdd;
                    actionLog.addSoulstones(this, statToAdd, countToAdd);
                    view.requestUpdate("updateSoulstones", null);
                });
            },
        });
        
        function adjustMineSoulstones() {
            let town = towns[3];
            let baseMine = Math.round(town.getLevel("Cavern") * 3 * adjustContentFromPrestige());
            town.totalMineSoulstones = Math.floor(baseMine * getSkillMod("Spatiomancy", 700, 900, .5) + baseMine * getSurveyBonus(town));
        }
        
        Action.HuntTrolls = new MultipartAction("Hunt Trolls", {
            type: "multipart",
            expMult: 1.5,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3].totalHuntTrolls >= 1;
                    case 2:
                        return storyFlags.slay6TrollsInALoop;
                    case 3:
                        return storyFlags.slay20TrollsInALoop;
                }
                return false;
            },
            stats: {
                Str: 0.3,
                Dex: 0.3,
                Con: 0.2,
                Per: 0.1,
                Int: 0.1
            },
            skills: {
                Combat: 1000
            },
            loopStats: ["Per", "Con", "Dex", "Str", "Int"],
            manaCost() {
                return 8000;
            },
            loopCost(segment, loopCounter = towns[this.townNum].HuntTrollsLoopCounter) {
                return precision3(Math.pow(2, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 1e6);
            },
            tickProgress(_offset, _loopCounter, totalCompletions = towns[3].totalHuntTrolls) {
                return (getSelfCombat() * Math.sqrt(1 + totalCompletions / 100));
            },
            loopsFinished() {
                handleSkillExp(this.skills);
                addResource("blood", 1);
                if (resources.blood >= 6) setStoryFlag("slay6TrollsInALoop");
                if (resources.blood >= 20) setStoryFlag("slay20TrollsInALoop");
            },
            segmentFinished() {
            },
            getPartName() {
                return "Hunt Troll";
            },
            visible() {
                return towns[3].getLevel("Cavern") >= 5;
            },
            unlocked() {
                return towns[3].getLevel("Cavern") >= 50;
            },
            finish() {
                //handleSkillExp(this.skills);
            },
        });
        
        Action.CheckWalls = new Action("Check Walls", {
            type: "progress",
            expMult: 1,
            townNum: 3,
            varName: "Illusions",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[3].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[3].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[3].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[3].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[3].getLevel(this.varName) >= 70;
                    case 7:
                        return towns[3].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[3].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Spd: 0.1,
                Dex: 0.1,
                Per: 0.4,
                Int: 0.4
            },
            manaCost() {
                return 3000;
            },
            visible() {
                return towns[3].getLevel("Cavern") >= 40;
            },
            unlocked() {
                return towns[3].getLevel("Cavern") >= 80;
            },
            finish() {
                towns[3].finishProgress(this.varName, 100);
            },
        });
        
        Action.TakeArtifacts = new Action("Take Artifacts", {
            type: "limited",
            expMult: 1,
            townNum: 3,
            varName: "Artifacts",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[3][`good${this.varName}`] >= 1;
                    case 2:
                        return towns[3][`good${this.varName}`] >= 20;
                    case 3:
                        return towns[3][`good${this.varName}`] >= 50;
                }
                return false;
            },
            stats: {
                Spd: 0.2,
                Per: 0.6,
                Int: 0.2,
            },
            manaCost() {
                return 1500;
            },
            visible() {
                return towns[3].getLevel("Illusions") >= 1;
            },
            unlocked() {
                return towns[3].getLevel("Illusions") >= 5;
            },
            finish() {
                towns[3].finishRegular(this.varName, 25, () => {
                    addResource("artifacts", 1);
                });
            },
        });
        function adjustArtifacts() {
            let town = towns[3];
            let baseArtifacts = Math.round(town.getLevel("Illusions") * 5 * adjustContentFromPrestige());
            town.totalArtifacts = Math.floor(baseArtifacts * getSkillMod("Spatiomancy", 800, 1000, .5) + baseArtifacts * getSurveyBonus(town));
        }
        
        Action.ImbueMind = new MultipartAction("Imbue Mind", {
            type: "multipart",
            expMult: 5,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.imbueMindThirdSegmentReached || getBuffLevel("Imbuement") >= 1;
                    case 2:
                        return getBuffLevel("Imbuement") >= 1;
                    case 3:
                        return getBuffLevel("Imbuement") >= 50;
                    case 4:
                        return getBuffLevel("Imbuement") >= 500;
                }
                return false;
            },
            stats: {
                Spd: 0.1,
                Per: 0.1,
                Int: 0.8
            },
            loopStats: ["Spd", "Per", "Int"],
            manaCost() {
                return 500000;
            },
            allowed() {
                return 1;
            },
            canStart(loopCounter = towns[3].ImbueMindLoopCounter) {
                return loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Imbuement") < getBuffCap("Imbuement");
            },
            loopCost(segment) {
                return 100000000 * (segment * 5 + 1);
            },
            tickProgress(offset) {
                return getSkillLevel("Magic");
            },
            grantsBuff: "Imbuement",
            loopsFinished() {
                const spent = sacrificeSoulstones(this.goldCost());
                trainingLimits = globalThis.IdleLoopsMetaProgression.increaseTrainingLimits(trainingLimits);
                addBuffAmt("Imbuement", 1, this, "soulstone", spent);
                view.requestUpdate("updateSoulstones", null);
                view.requestUpdate("adjustGoldCost", {varName: "ImbueMind", cost: this.goldCost()});
            },
            getPartName() {
                return "Imbue Mind";
            },
            visible() {
                return towns[3].getLevel("Illusions") >= 50;
            },
            unlocked() {
                return towns[3].getLevel("Illusions") >= 70 && getSkillLevel("Magic") >= 300;
            },
            goldCost() {
                return 20 * (getBuffLevel("Imbuement") + 1);
            },
            finish() {
                view.requestUpdate("updateBuff", "Imbuement");
                if (options.autoMaxTraining) capAllTraining();
                if (towns[3].ImbueMindLoopCounter >= 0) setStoryFlag("imbueMindThirdSegmentReached");
            },
        });
        
        Action.ImbueBody = new MultipartAction("Imbue Body", {
            type: "multipart",
            expMult: 5,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.imbueBodyThirdSegmentReached || getBuffLevel("Imbuement2") >= 1;
                    case 2:
                        return getBuffLevel("Imbuement2") >= 1;
                    case 3:
                        return getBuffLevel("Imbuement2") >= 50;
                    case 4:
                        return getBuffLevel("Imbuement2") >= 500;
                    case 5:
                        //Since the action cannot be performed once you hit level 500, give the
                        //action story here so you don't end up unable to 100% the action stories.
                        return storyFlags.failedImbueBody || getBuffLevel("Imbuement2") >= 500;
                }
                return false;
            },
            stats: {
                Dex: 0.1,
                Str: 0.1,
                Con: 0.8
            },
            loopStats: ["Dex", "Str", "Con"],
            manaCost() {
                return 500000;
            },
            allowed() {
                return 1;
            },
            canStart(loopCounter = towns[3].ImbueBodyLoopCounter) {
                let tempCanStart = true;
                for (const stat of statList) {
                    if (getTalent(stat) < getBuffLevel("Imbuement2") + 1) tempCanStart = false;
                }
                return loopCounter === 0 && (getBuffLevel("Imbuement") > getBuffLevel("Imbuement2")) && tempCanStart;
            },
            loopCost(segment) {
                return 100000000 * (segment * 5 + 1);
            },
            tickProgress(offset) {
                return getSkillLevel("Magic");
            },
            grantsBuff: "Imbuement2",
            loopsFinished() {
                /** @type {SoulstoneEntry["stones"]} */
                const spent = {};
                for (const stat of statList) {
                    const currentTalentLevel = getTalent(stat);
                    const targetTalentLevel = Math.max(currentTalentLevel - getBuffLevel("Imbuement2") - 1, 0);
                    globalThis.IdleLoopsCharacterState.setTalentLevel(stats, stat, targetTalentLevel);
                    spent[stat] = currentTalentLevel - targetTalentLevel;
                }
                view.updateStats();
                addBuffAmt("Imbuement2", 1, this, "talent", spent);
                view.requestUpdate("adjustGoldCost", {varName: "ImbueBody", cost: this.goldCost()});
            },
            getPartName() {
                return "Imbue Body";
            },
            visible() {
                return getBuffLevel("Imbuement") >= 1
            },
            unlocked() {
                return getBuffLevel("Imbuement") >= 1;
            },
            goldCost() {
                return getBuffLevel("Imbuement2") + 1;
            },
            finish() {
                view.requestUpdate("updateBuff", "Imbuement2");
            },
        });
        
        Action.FaceJudgement = new Action("Face Judgement", {
            type: "normal",
            expMult: 2,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.judgementFaced;
                    case 2:
                        return storyFlags.acceptedIntoValhalla;
                    case 3:
                        return storyFlags.castIntoShadowRealm;
                    case 4:
                        return storyFlags.ignoredByGods;
                }
                return false;
            },
            stats: {
                Cha: 0.3,
                Luck: 0.2,
                Soul: 0.5,
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 30000;
            },
            visible() {
                return towns[3].getLevel("Mountain") >= 40;
            },
            unlocked() {
                return towns[3].getLevel("Mountain") >= 100;
            },
            finish() {
                setStoryFlag("judgementFaced");
                if (resources.reputation >= 50) {
                    setStoryFlag("acceptedIntoValhalla");
                    unlockGlobalStory(6);
                    unlockTown(4);
                } else if (resources.reputation <= -50) {
                    setStoryFlag("castIntoShadowRealm");
                    unlockGlobalStory(7);
                    unlockTown(5);
                } else {
                    setStoryFlag("ignoredByGods");
                }
            },
        });
        
        Action.Guru = new Action("Guru", {
            type: "normal",
            expMult: 1,
            townNum: 3,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.spokeToGuru;
                }
            },
            stats: {
                Cha: 0.5,
                Soul: 0.5
            },
            allowed() {
                return 1;
            },
            manaCost() {
                return 100000;
            },
            cost() {
                addResource("herbs", -1000);
            },
            canStart() {
                return resources.herbs >= 1000;
            },
            visible() {
                return getExploreProgress() > 75;
            },
            unlocked() {
                return getExploreProgress() >= 100;
            },
            finish() {
                unlockTown(4);
                setStoryFlag("spokeToGuru");
            },
        });

        cachedDefinitions = Object.freeze({
            adjustGeysers,
            adjustMineSoulstones,
            adjustArtifacts,
        });

        global.adjustGeysers = adjustGeysers;
        global.adjustMineSoulstones = adjustMineSoulstones;
        global.adjustArtifacts = adjustArtifacts;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerOlympusActions,
    });
})(globalThis);