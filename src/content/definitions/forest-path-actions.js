"use strict";

(function setupForestPathActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerForestPathActions = function registerForestPathActions({Action, MultipartAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

        Action.ExploreForest = new Action("Explore Forest", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Forest",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 50;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.4,
                Con: 0.2,
                Spd: 0.2,
                Luck: 0.2
            },
            affectedBy: ["Buy Glasses"],
            manaCost() {
                return 400;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            finish() {
                towns[1].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
            },
        });
        function adjustWildMana() {
            let town = towns[1];
            let baseWildMana = Math.round((town.getLevel("Forest") * 5 + town.getLevel("Thicket") * 5) * adjustContentFromPrestige());
            town.totalWildMana = Math.floor(baseWildMana + baseWildMana * getSurveyBonus(town));
        }
        function adjustHunt() {
            let town = towns[1];
            let baseHunt = Math.round(town.getLevel("Forest") * 2 * adjustContentFromPrestige());
            town.totalHunt = Math.floor(baseHunt * getSkillMod("Spatiomancy", 400, 600, .5) + baseHunt * getSurveyBonus(town));
        }
        function adjustHerbs() {
            let town = towns[1];
            let baseHerbs = Math.round((town.getLevel("Forest") * 5 + town.getLevel("Shortcut") * 2 + town.getLevel("Flowers") * 13) * adjustContentFromPrestige());
            town.totalHerbs = Math.floor(baseHerbs * getSkillMod("Spatiomancy", 500, 700, .5) + baseHerbs * getSurveyBonus(town));
        }
        
        Action.WildMana = new Action("Wild Mana", {
            type: "limited",
            expMult: 1,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[1][`good${this.varName}`] >= 100;
                    case 3:
                        return towns[1][`good${this.varName}`] >= 150;
                }
                return false;
            },
            stats: {
                Con: 0.2,
                Int: 0.6,
                Soul: 0.2
            },
            manaCost() {
                return Math.ceil(150 * getSkillBonus("Practical"));
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 2;
            },
            goldCost() {
                return Math.floor(250 * getSkillBonus("Dark"));
            },
            finish() {
                towns[1].finishRegular(this.varName, 10, () => {
                    const manaGain = this.goldCost();
                    addMana(manaGain);
                    return manaGain;
                });
            }
        });
        
        Action.GatherHerbs = new Action("Gather Herbs", {
            type: "limited",
            expMult: 1,
            townNum: 1,
            varName: "Herbs",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[1][`good${this.varName}`] >= 200;
                    case 3:
                        return towns[1][`good${this.varName}`] >= 500;
                }
                return false;
            },
            stats: {
                Str: 0.4,
                Dex: 0.3,
                Int: 0.3
            },
            manaCost() {
                return Math.ceil(200 * (1 - towns[1].getLevel("Hermit") * 0.005));
            },
            visible() {
                return towns[1].getLevel("Forest") >= 2;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 10;
            },
            finish() {
                towns[1].finishRegular(this.varName, 10, () => {
                    addResource("herbs", 1);
                    return 1;
                });
            },
        });
        
        Action.Hunt = new Action("Hunt", {
            type: "limited",
            expMult: 1,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[1][`good${this.varName}`] >= 10;
                    case 3:
                        return towns[1][`good${this.varName}`] >= 20;
                    case 4:
                        return towns[1][`good${this.varName}`] >= 50;
                }
                return false;
            },
            stats: {
                Dex: 0.2,
                Con: 0.2,
                Per: 0.2,
                Spd: 0.4
            },
            manaCost() {
                return 800;
            },
            visible() {
                return towns[1].getLevel("Forest") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 40;
            },
            finish() {
                towns[1].finishRegular(this.varName, 10, () => {
                    addResource("hide", 1);
                    return 1;
                });
            },
        });
        
        Action.SitByWaterfall = new Action("Sit By Waterfall", {
            type: "normal",
            expMult: 4,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.satByWaterfall;
                    case 2: return storyFlags.satByWaterfall && getTalent("Soul") >= 100;
                    case 3: return storyFlags.satByWaterfall && getTalent("Soul") >= 1000;
                    case 4: return storyFlags.satByWaterfall && getTalent("Soul") >= 10000;
                    case 5: return storyFlags.satByWaterfall && getTalent("Soul") >= 100000;
                }
                return false;
            },
            stats: {
                Con: 0.2,
                Soul: 0.8
            },
            allowed() {
                return trainingLimits;
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[1].getLevel("Forest") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 70;
            },
            finish() {
                setStoryFlag("satByWaterfall");
            },
        });
        
        Action.OldShortcut = new Action("Old Shortcut", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Shortcut",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.3,
                Con: 0.4,
                Spd: 0.2,
                Luck: 0.1
            },
            manaCost() {
                return 800;
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 20;
            },
            finish() {
                towns[1].finishProgress(this.varName, 100);
                view.requestUpdate("adjustManaCost", "Continue On");
            },
        });
        
        Action.TalkToHermit = new Action("Talk To Hermit", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Hermit",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Con: 0.5,
                Cha: 0.3,
                Soul: 0.2
            },
            manaCost() {
                return 1200;
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[1].getLevel("Shortcut") >= 20 && getSkillLevel("Magic") >= 40;
            },
            finish() {
                towns[1].finishProgress(this.varName, 50 * (1 + towns[1].getLevel("Shortcut") / 100));
                view.requestUpdate("adjustManaCost", "Learn Alchemy");
                view.requestUpdate("adjustManaCost", "Gather Herbs");
                view.requestUpdate("adjustManaCost", "Practical Magic");
            },
        });
        
        Action.PracticalMagic = new Action("Practical Magic", {
            type: "normal",
            expMult: 1.5,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Practical") >= 1;
                    case 2:
                        return getSkillLevel("Practical") >= 100;
                    case 3:
                        return getSkillLevel("Practical") >= 400;
                }
                return false;
            },
            stats: {
                Per: 0.3,
                Con: 0.2,
                Int: 0.5
            },
            skills: {
                Practical: 100
            },
            manaCost() {
                return Math.ceil(4000 * (1 - towns[1].getLevel("Hermit") * 0.005));
            },
            visible() {
                return towns[1].getLevel("Hermit") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Hermit") >= 20 && getSkillLevel("Magic") >= 50;
            },
            finish() {
                handleSkillExp(this.skills);
                view.requestUpdate("adjustManaCost", "Wild Mana");
                view.requestUpdate("adjustManaCost", "Smash Pots");
                view.requestUpdate("adjustGoldCosts", null);
            },
        });
        
        Action.LearnAlchemy = new Action("Learn Alchemy", {
            type: "normal",
            expMult: 1.5,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return skills.Alchemy.exp >= 50;
                    case 2:
                        return getSkillLevel("Alchemy") >= 25;
                    case 3:
                        return getSkillLevel("Alchemy") >= 100;
                    case 4:
                        return getSkillLevel("Alchemy") >= 500;
                }
                return false;
            },
            stats: {
                Con: 0.3,
                Per: 0.1,
                Int: 0.6
            },
            skills: {
                Magic: 50,
                Alchemy: 50
            },
            canStart() {
                return resources.herbs >= 10;
            },
            cost() {
                addResource("herbs", -10);
            },
            manaCost() {
                return Math.ceil(5000 * (1 - towns[1].getLevel("Hermit") * 0.005));
            },
            visible() {
                return towns[1].getLevel("Hermit") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Hermit") >= 40 && getSkillLevel("Magic") >= 60;
            },
            finish() {
                handleSkillExp(this.skills);
                view.requestUpdate("adjustExpGain", Action.MageLessons);
            },
        });
        
        Action.BrewPotions = new Action("Brew Potions", {
            type: "normal",
            expMult: 1.5,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.potionBrewed;
                    case 2:
                        return storyFlags.brewed50PotionsInALoop;
                    case 3:
                        return storyFlags.failedBrewPotions;
                    case 4:
                        return storyFlags.failedBrewPotionsNegativeRep;
                }
                return false;
            },
            stats: {
                Dex: 0.3,
                Int: 0.6,
                Luck: 0.1,
            },
            skills: {
                Magic: 50,
                Alchemy: 25
            },
            canStart() {
                return resources.herbs >= 10 && resources.reputation >= 5;
            },
            cost() {
                addResource("herbs", -10);
            },
            manaCost() {
                return Math.ceil(4000);
            },
            visible() {
                return getSkillLevel("Alchemy") >= 1;
            },
            unlocked() {
                return getSkillLevel("Alchemy") >= 10;
            },
            finish() {
                addResource("potions", 1);
                handleSkillExp(this.skills);
                setStoryFlag("potionBrewed");
                if (resources.potions >= 50) {
                    setStoryFlag("brewed50PotionsInALoop");
                }
            },
        });
        
        Action.TrainDexterity = new Action("Train Dexterity", {
            type: "normal",
            expMult: 4,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.dexterityTrained;
                    case 2: return storyFlags.dexterityTrained && getTalent("Dex") >= 100;
                    case 3: return storyFlags.dexterityTrained && getTalent("Dex") >= 1000;
                    case 4: return storyFlags.dexterityTrained && getTalent("Dex") >= 10000;
                    case 5: return storyFlags.dexterityTrained && getTalent("Dex") >= 100000;
                }
                return false;
            },
            stats: {
                Dex: 0.8,
                Con: 0.2
            },
            allowed() {
                return trainingLimits;
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[1].getLevel("Forest") >= 20;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 60;
            },
            finish() {
                setStoryFlag("dexterityTrained");
            },
        });
        
        Action.TrainSpeed = new Action("Train Speed", {
            type: "normal",
            expMult: 4,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.speedTrained;
                    case 2: return storyFlags.speedTrained && getTalent("Spd") >= 100;
                    case 3: return storyFlags.speedTrained && getTalent("Spd") >= 1000;
                    case 4: return storyFlags.speedTrained && getTalent("Spd") >= 10000;
                    case 5: return storyFlags.speedTrained && getTalent("Spd") >= 100000;
                }
                return false;
            },
            stats: {
                Spd: 0.8,
                Con: 0.2
            },
            allowed() {
                return trainingLimits;
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[1].getLevel("Forest") >= 20;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 80;
            },
            finish() {
                setStoryFlag("speedTrained");
            },
        });
        
        Action.FollowFlowers = new Action("Follow Flowers", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Flowers",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Per: 0.7,
                Con: 0.1,
                Spd: 0.2
            },
            affectedBy: ["Buy Glasses"],
            manaCost() {
                return 300;
            },
            visible() {
                return towns[1].getLevel("Forest") >= 30;
            },
            unlocked() {
                return towns[1].getLevel("Forest") >= 50;
            },
            finish() {
                towns[1].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
            },
        });
        
        Action.BirdWatching = new Action("Bird Watching", {
            type: "normal",
            expMult: 4,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.birdsWatched;
                    case 2: return storyFlags.birdsWatched && getTalent("Per") >= 100;
                    case 3: return storyFlags.birdsWatched && getTalent("Per") >= 1000;
                    case 4: return storyFlags.birdsWatched && getTalent("Per") >= 10000;
                    case 5: return storyFlags.birdsWatched && getTalent("Per") >= 100000;
                }
                return false;
            },
            stats: {
                Per: 0.8,
                Int: 0.2
            },
            affectedBy: ["Buy Glasses"],
            allowed() {
                return trainingLimits;
            },
            manaCost() {
                return 2000;
            },
            canStart() {
                return resources.glasses;
            },
            visible() {
                return towns[1].getLevel("Flowers") >= 30;
            },
            unlocked() {
                return towns[1].getLevel("Flowers") >= 80;
            },
            finish() {
                setStoryFlag("birdsWatched");
            },
        });
        
        Action.ClearThicket = new Action("Clear Thicket", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Thicket",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.1,
                Str: 0.2,
                Per: 0.3,
                Con: 0.2,
                Spd: 0.2
            },
            manaCost() {
                return 500;
            },
            visible() {
                return towns[1].getLevel("Flowers") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Flowers") >= 20;
            },
            finish() {
                towns[1].finishProgress(this.varName, 100);
            },
        });
        
        Action.TalkToWitch = new Action("Talk To Witch", {
            type: "progress",
            expMult: 1,
            townNum: 1,
            varName: "Witch",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[1].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[1].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[1].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[1].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[1].getLevel(this.varName) >= 50;
                    case 6:
                        return towns[1].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[1].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[1].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Cha: 0.3,
                Int: 0.2,
                Soul: 0.5
            },
            manaCost() {
                return 1500;
            },
            visible() {
                return towns[1].getLevel("Thicket") >= 20;
            },
            unlocked() {
                return towns[1].getLevel("Thicket") >= 60 && getSkillLevel("Magic") >= 80;
            },
            finish() {
                towns[1].finishProgress(this.varName, 100);
                view.requestUpdate("adjustManaCost", "Dark Magic");
                view.requestUpdate("adjustManaCost", "Dark Ritual");
            },
        });
        
        Action.DarkMagic = new Action("Dark Magic", {
            type: "normal",
            expMult: 1.5,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return getSkillLevel("Dark") >= 1;
                    case 2:
                        return getSkillLevel("Dark") >= 25;
                    case 3:
                        return getSkillLevel("Dark") >= 50;
                    case 4:
                        return getSkillLevel("Dark") >= 300;
                }
                return false;
            },
            stats: {
                Con: 0.2,
                Int: 0.5,
                Soul: 0.3
            },
            skills: {
                Dark() {
                    return Math.floor(100 * (1 + getBuffLevel("Ritual") / 100));
                }
            },
            manaCost() {
                return Math.ceil(6000 * (1 - towns[1].getLevel("Witch") * 0.005));
            },
            canStart() {
                return resources.reputation <= 0;
            },
            cost() {
                addResource("reputation", -1);
            },
            visible() {
                return towns[1].getLevel("Witch") >= 10;
            },
            unlocked() {
                return towns[1].getLevel("Witch") >= 20 && getSkillLevel("Magic") >= 100;
            },
            finish() {
                handleSkillExp(this.skills);
                view.requestUpdate("adjustGoldCost", {varName: "Pots", cost: Action.SmashPots.goldCost()});
                view.requestUpdate("adjustGoldCost", {varName: "WildMana", cost: Action.WildMana.goldCost()});
            },
        });
        
        Action.DarkRitual = new MultipartAction("Dark Ritual", {
            type: "multipart",
            expMult: 10,
            townNum: 1,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.darkRitualThirdSegmentReached;
                    case 2:
                        return getBuffLevel("Ritual") >= 1;
                    case 3:
                        return getBuffLevel("Ritual") >= 50;
                    case 4:
                        return getBuffLevel("Ritual") >= 300;
                    case 5:
                        return getBuffLevel("Ritual") >= 666;
                }
                return false;
            },
            stats: {
                Spd: 0.1,
                Int: 0.1,
                Soul: 0.8
            },
            loopStats: ["Spd", "Int", "Soul"],
            manaCost() {
                return Math.ceil(50000 * (1 - towns[1].getLevel("Witch") * 0.005));
            },
            allowed() {
                return 1;
            },
            canStart(loopCounter = towns[this.townNum].DarkRitualLoopCounter) {
                return resources.reputation <= -5 && loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Ritual") < getBuffCap("Ritual");
            },
            loopCost(segment) {
                return 1000000 * (segment * 2 + 1);
            },
            tickProgress(offset) {
                return getSkillLevel("Dark") / (1 - towns[1].getLevel("Witch") * 0.005);
            },
            grantsBuff: "Ritual",
            loopsFinished() {
                const spent = sacrificeSoulstones(this.goldCost());
                addBuffAmt("Ritual", 1, this, "soulstone", spent);
                view.requestUpdate("updateSoulstones", null);
                view.requestUpdate("adjustGoldCost", {varName: "DarkRitual", cost: this.goldCost()});
            },
            getPartName() {
                return "Perform Dark Ritual";
            },
            visible() {
                return towns[1].getLevel("Witch") >= 20;
            },
            unlocked() {
                return towns[1].getLevel("Witch") >= 50 && getSkillLevel("Dark") >= 50;
            },
            goldCost() {
                return Math.ceil(50 * (getBuffLevel("Ritual") + 1) * getSkillBonus("Commune"));
            },
            finish() {
                view.requestUpdate("updateBuff", "Ritual");
                view.requestUpdate("adjustExpGain", Action.DarkMagic);
                if (towns[1].DarkRitualLoopCounter >= 0) setStoryFlag("darkRitualThirdSegmentReached");
            },
        });

        cachedDefinitions = Object.freeze({
            adjustWildMana,
            adjustHunt,
            adjustHerbs,
        });

        global.adjustWildMana = adjustWildMana;
        global.adjustHunt = adjustHunt;
        global.adjustHerbs = adjustHerbs;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerForestPathActions,
    });
})(globalThis);