"use strict";

(function setupMerchantonActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerMerchantonActions = function registerMerchantonActions({Action, MultipartAction, DungeonAction, TrialAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

        Action.ExploreCity = new Action("Explore City", {
            type: "progress",
            expMult: 1,
            townNum: 2,
            varName: "City",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[2].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[2].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[2].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[2].getLevel(this.varName) >= 50;
                    case 6:
                        return towns[2].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[2].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[2].getLevel(this.varName) >= 90;
                    case 9:
                        return towns[2].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Con: 0.1,
                Per: 0.3,
                Cha: 0.2,
                Spd: 0.3,
                Luck: 0.1
            },
            affectedBy: ["Buy Glasses"],
            manaCost() {
                return 750;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            finish() {
                towns[2].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
            },
        });
        function adjustSuckers() {
            let town = towns[2];
            let baseGamble = Math.round(town.getLevel("City") * 3 * adjustContentFromPrestige());
            town.totalGamble = Math.floor(baseGamble * getSkillMod("Spatiomancy", 600, 800, .5) + baseGamble * getSurveyBonus(town));
        }
        
        Action.Gamble = new Action("Gamble", {
            type: "limited",
            expMult: 2,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2][`checked${this.varName}`] >= 1;
                    case 2:
                        return towns[2][`good${this.varName}`] >= 1;
                    case 3:
                        return towns[2][`good${this.varName}`] >= 30;
                    case 4:
                        return towns[2][`good${this.varName}`] >= 75;
                    case 5:
                        return storyFlags.failedGamble;
                    case 6:
                        return storyFlags.failedGambleLowMoney;
                }
                return false;
            },
            stats: {
                Cha: 0.2,
                Luck: 0.8
            },
            canStart() {
                return resources.gold >= 20 && resources.reputation >= -5;
            },
            cost() {
                addResource("gold", -20);
                addResource("reputation", -1);
            },
            manaCost() {
                return 1000;
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[2].getLevel("City") >= 10;
            },
            finish() {
                towns[2].finishRegular(this.varName, 10, () => {
                    let goldGain = Math.floor(60 * getSkillBonus("Thievery"));
                    addResource("gold", goldGain);
                    return 60;
                });
            },
        });
        
        Action.GetDrunk = new Action("Get Drunk", {
            type: "progress",
            expMult: 3,
            townNum: 2,
            varName: "Drunk",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[2].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[2].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[2].getLevel(this.varName) >= 30;
                    case 5:
                        return towns[2].getLevel(this.varName) >= 40;
                    case 6:
                        return towns[2].getLevel(this.varName) >= 60;
                    case 7:
                        return towns[2].getLevel(this.varName) >= 80;
                    case 8:
                        return towns[2].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Str: 0.1,
                Cha: 0.5,
                Con: 0.2,
                Soul: 0.2
            },
            canStart() {
                return resources.reputation >= -3;
            },
            cost() {
                addResource("reputation", -1);
            },
            manaCost() {
                return 1000;
            },
            visible() {
                return true;
            },
            unlocked() {
                return towns[2].getLevel("City") >= 20;
            },
            finish() {
                towns[2].finishProgress(this.varName, 100);
            },
        });
        
        Action.BuyManaZ3 = new Action("Buy Mana Z3", {
            type: "normal",
            expMult: 1,
            townNum: 2,
            storyReqs(storyNum) {
                switch(storyNum) {
                    case 1:
                        return storyFlags.manaZ3Bought;
                }
            },
            stats: {
                Cha: 0.7,
                Int: 0.2,
                Luck: 0.1
            },
            manaCost() {
                return 100;
            },
            canStart() {
                return !portalUsed;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            goldCost() {
                return Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige());
            },
            finish() {
                addMana(resources.gold * this.goldCost());
                setStoryFlag("manaZ3Bought");
                resetResource("gold");
            },
        });
        
        Action.SellPotions = new Action("Sell Potions", {
            type: "normal",
            expMult: 1,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.potionSold;
                    case 2:
                        return storyFlags.sell20PotionsInALoop;
                    case 3:
                        return storyFlags.sellPotionFor100Gold;
                    case 4:
                        return storyFlags.sellPotionFor1kGold;
                }
                return false;
            },
            stats: {
                Cha: 0.7,
                Int: 0.2,
                Luck: 0.1
            },
            manaCost() {
                return 1000;
            },
            visible() {
                return true;
            },
            unlocked() {
                return true;
            },
            finish() {
                if (resources.potions >= 20) setStoryFlag("sell20PotionsInALoop");
                addResource("gold", resources.potions * getSkillLevel("Alchemy"));
                resetResource("potions");
                setStoryFlag("potionSold");
                if (getSkillLevel("Alchemy") >= 100) setStoryFlag("sellPotionFor100Gold");
                if (getSkillLevel("Alchemy") >= 1000) setStoryFlag("sellPotionFor1kGold");
            },
        });
        
        // the guild actions are somewhat unique in that they override the default segment naming
        // with their own segment names, and so do not use the segmentNames inherited from
        // MultipartAction
        Action.AdventureGuild = new MultipartAction("Adventure Guild", {
            type: "multipart",
            expMult: 1,
            townNum: 2,
            varName: "AdvGuild",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.advGuildTestsTaken;
                    case 2:
                        return storyFlags.advGuildRankEReached;
                    case 3:
                        return storyFlags.advGuildRankDReached;
                    case 4:
                        return storyFlags.advGuildRankCReached;
                    case 5:
                        return storyFlags.advGuildRankBReached;
                    case 6:
                        return storyFlags.advGuildRankAReached;
                    case 7:
                        return storyFlags.advGuildRankSReached;
                    case 8:
                        return storyFlags.advGuildRankUReached;
                    case 9:
                        return storyFlags.advGuildRankGodlikeReached;
                }
                return false;
            },
            stats: {
                Str: 0.4,
                Dex: 0.3,
                Con: 0.3
            },
            loopStats: ["Str", "Dex", "Con"],
            manaCost() {
                return 3000;
            },
            allowed() {
                return 1;
            },
            canStart() {
                return guild === "";
            },
            loopCost(segment, loopCounter = towns[2][`${this.varName}LoopCounter`]) {
                return precision3(Math.pow(1.2, loopCounter + segment)) * 5e6;
            },
            tickProgress(offset, loopCounter, totalCompletions = towns[2][`total${this.varName}`]) {
                return (getSkillLevel("Magic") / 2 +
                        getSelfCombat()) *
                        Math.sqrt(1 + totalCompletions / 1000);
            },
            loopsFinished() {
                if (curAdvGuildSegment >= 3) setStoryFlag("advGuildRankEReached");
                if (curAdvGuildSegment >= 6) setStoryFlag("advGuildRankDReached");
                if (curAdvGuildSegment >= 9) setStoryFlag("advGuildRankCReached");
                if (curAdvGuildSegment >= 12) setStoryFlag("advGuildRankBReached");
                if (curAdvGuildSegment >= 15) setStoryFlag("advGuildRankAReached");
                if (curAdvGuildSegment >= 18) setStoryFlag("advGuildRankSReached");
                if (curAdvGuildSegment >= 30) setStoryFlag("advGuildRankUReached");
                if (curAdvGuildSegment >= 42) setStoryFlag("advGuildRankGodlikeReached");
            },
            segmentFinished() {
                curAdvGuildSegment++;
                addMana(200);
            },
            getPartName() {
                return `Rank ${getAdvGuildRank().name}`;
            },
            getSegmentName(segment) {
                return `Rank ${getAdvGuildRank(segment % 3).name}`;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 5;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 20;
            },
            finish() {
                guild = "Adventure";
                setStoryFlag("advGuildTestsTaken");
            },
        });
        function getAdvGuildRank(offset) {
            let name = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "SSSS", "U", "UU", "UUU", "UUUU"][Math.floor(curAdvGuildSegment / 3 + 0.00001)];
        
            const segment = (offset === undefined ? 0 : offset - (curAdvGuildSegment % 3)) + curAdvGuildSegment;
            let bonus = precision3(1 + segment / 20 + Math.pow(segment, 2) / 300);
            if (name) {
                if (offset === undefined) {
                    name += ["-", "", "+"][curAdvGuildSegment % 3];
                } else {
                    name += ["-", "", "+"][offset % 3];
                }
            } else {
                name = "Godlike";
                bonus = 10;
            }
            name += `, Mult x${bonus}`;
            return { name, bonus };
        }
        
        Action.GatherTeam = new Action("Gather Team", {
            type: "normal",
            expMult: 3,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.teammateGathered;
                    case 2:
                        return storyFlags.fullParty;
                    case 3:
                        return storyFlags.failedGatherTeam;
                }
                return false;
            },
            stats: {
                Per: 0.2,
                Cha: 0.5,
                Int: 0.2,
                Luck: 0.1
            },
            affectedBy: ["Adventure Guild"],
            allowed() {
                return 5 + Math.floor(getSkillLevel("Leadership") / 100);
            },
            canStart() {
                return guild === "Adventure" && resources.gold >= (resources.teamMembers + 1) * 100;
            },
            cost() {
                // cost comes after finish
                addResource("gold", -(resources.teamMembers) * 100);
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 10;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 20;
            },
            finish() {
                addResource("teamMembers", 1);
                setStoryFlag("teammateGathered");
                if (resources.teamMembers >= 5) setStoryFlag("fullParty");
            },
        });
        
        Action.LargeDungeon = new DungeonAction("Large Dungeon", 1, {
            type: "multipart",
            expMult: 2,
            townNum: 2,
            varName: "LDungeon",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.largeDungeonAttempted;
                    case 2:
                        return towns[2][`total${this.varName}`] >= 2000;
                    case 3:
                        return towns[2][`total${this.varName}`] >= 10000;
                    case 4:
                        return towns[2][`total${this.varName}`] >= 20000;
                    case 5:
                        return storyFlags.clearLDungeon;
                }
                return false;
            },
            stats: {
                Str: 0.2,
                Dex: 0.2,
                Con: 0.2,
                Cha: 0.3,
                Luck: 0.1
            },
            skills: {
                Combat: 15,
                Magic: 15
            },
            loopStats: ["Cha", "Spd", "Str", "Cha", "Dex", "Dex", "Str"],
            affectedBy: ["Gather Team"],
            manaCost() {
                return 6000;
            },
            canStart(loopCounter = towns[this.townNum].LDungeonLoopCounter) {
                const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001);
                return resources.teamMembers >= 1 && curFloor < dungeons[this.dungeonNum].length;
            },
            loopCost(segment, loopCounter = towns[this.townNum].LDungeonLoopCounter) {
                return precision3(Math.pow(3, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 5e5);
            },
            tickProgress(offset, loopCounter = towns[this.townNum].LDungeonLoopCounter) {
                const floor = Math.floor((loopCounter) / this.segments + 0.0000001);
                return (getTeamCombat() + getSkillLevel("Magic")) *
                    Math.sqrt(1 + dungeons[this.dungeonNum][floor].completed / 200);
            },
            loopsFinished(loopCounter = towns[this.townNum].LDungeonLoopCounter) {
                const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001 - 1);
                this.finishDungeon(curFloor);
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 5;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 20;
            },
            finish() {
                handleSkillExp(this.skills);
                setStoryFlag("largeDungeonAttempted");
                if (towns[2].LDungeonLoopCounter >= 63) setStoryFlag("clearLDungeon");
            },
        });
        
        Action.CraftingGuild = new MultipartAction("Crafting Guild", {
            type: "multipart",
            expMult: 1,
            townNum: 2,
            varName: "CraftGuild",
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.craftGuildTestsTaken;
                    case 2:
                        return storyFlags.craftGuildRankEReached;
                    case 3:
                        return storyFlags.craftGuildRankDReached;
                    case 4:
                        return storyFlags.craftGuildRankCReached;
                    case 5:
                        return storyFlags.craftGuildRankBReached;
                    case 6:
                        return storyFlags.craftGuildRankAReached;
                    case 7:
                        return storyFlags.craftGuildRankSReached;
                    case 8:
                        return storyFlags.craftGuildRankUReached;
                    case 9:
                        return storyFlags.craftGuildRankGodlikeReached;
                }
                return false;
            },
            stats: {
                Dex: 0.3,
                Per: 0.3,
                Int: 0.4
            },
            skills: {
                Crafting: 50
            },
            loopStats: ["Int", "Per", "Dex"],
            manaCost() {
                return 3000;
            },
            allowed() {
                return 1;
            },
            canStart() {
                return guild === "";
            },
            loopCost(segment, loopCounter = towns[2][`${this.varName}LoopCounter`]) {
                return precision3(Math.pow(1.2, loopCounter + segment)) * 2e6;
            },
            tickProgress(_offset, _loopCounter, totalCompletions = towns[2][`total${this.varName}`]) {
                return (getSkillLevel("Magic") / 2 +
                        getSkillLevel("Crafting")) *
                        Math.sqrt(1 + totalCompletions / 1000);
            },
            loopsFinished() {
                if (curCraftGuildSegment >= 3) setStoryFlag("craftGuildRankEReached");
                if (curCraftGuildSegment >= 6) setStoryFlag("craftGuildRankDReached");
                if (curCraftGuildSegment >= 9) setStoryFlag("craftGuildRankCReached");
                if (curCraftGuildSegment >= 12) setStoryFlag("craftGuildRankBReached");
                if (curCraftGuildSegment >= 15) setStoryFlag("craftGuildRankAReached");
                if (curCraftGuildSegment >= 18) setStoryFlag("craftGuildRankSReached");
                if (curCraftGuildSegment >= 30) setStoryFlag("craftGuildRankUReached");
                if (curCraftGuildSegment >= 42) setStoryFlag("craftGuildRankGodlikeReached");
            },
            segmentFinished() {
                curCraftGuildSegment++;
                handleSkillExp(this.skills);
                addResource("gold", 10);
            },
            getPartName() {
                return `Rank ${getCraftGuildRank().name}`;
            },
            getSegmentName(segment) {
                return `Rank ${getCraftGuildRank(segment % 3).name}`;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 5;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 30;
            },
            finish() {
                guild = "Crafting";
                setStoryFlag("craftGuildTestsTaken");
            },
        });
        function getCraftGuildRank(offset) {
            let name = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "SSSS", "U", "UU", "UUU", "UUUU"][Math.floor(curCraftGuildSegment / 3 + 0.00001)];
        
            const segment = (offset === undefined ? 0 : offset - (curCraftGuildSegment % 3)) + curCraftGuildSegment;
            let bonus = precision3(1 + segment / 20 + Math.pow(segment, 2) / 300);
            if (name) {
                if (offset === undefined) {
                    name += ["-", "", "+"][curCraftGuildSegment % 3];
                } else {
                    name += ["-", "", "+"][offset % 3];
                }
            } else {
                name = "Godlike";
                bonus = 10;
            }
            name += `, Mult x${bonus}`;
            return { name, bonus };
        }
        
        Action.CraftArmor = new Action("Craft Armor", {
            type: "normal",
            expMult: 1,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.armorCrafted;
                    case 2:
                        return storyFlags.craft10Armor;
                    case 3:
                        return storyFlags.craft20Armor;
                    case 4:
                        return storyFlags.failedCraftArmor;
                }
                return false;
            },
            stats: {
                Str: 0.1,
                Dex: 0.3,
                Con: 0.3,
                Int: 0.3
            },
            // this.affectedBy = ["Crafting Guild"];
            canStart() {
                return resources.hide >= 2;
            },
            cost() {
                addResource("hide", -2);
            },
            manaCost() {
                return 1000;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 15;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 30;
            },
            finish() {
                addResource("armor", 1);
                setStoryFlag("armorCrafted");
                if (resources.armor >= 10) setStoryFlag("craft10Armor");
                if (resources.armor >= 25) setStoryFlag("craft20Armor");
            },
        });
        
        Action.Apprentice = new Action("Apprentice", {
            type: "progress",
            expMult: 1.5,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[2].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[2].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[2].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[2].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[2].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[2].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.2,
                Int: 0.4,
                Cha: 0.4
            },
            skills: {
                Crafting() {
                    return 10 * (1 + towns[2].getLevel("Apprentice") / 100);
                }
            },
            affectedBy: ["Crafting Guild"],
            canStart() {
                return guild === "Crafting";
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 20;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 40;
            },
            finish() {
                towns[2].finishProgress(this.varName, 30 * getCraftGuildRank().bonus);
                handleSkillExp(this.skills);
                view.requestUpdate("adjustExpGain", Action.Apprentice);
            },
        });
        
        Action.Mason = new Action("Mason", {
            type: "progress",
            expMult: 2,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[2].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[2].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[2].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[2].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[2].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[2].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.2,
                Int: 0.5,
                Cha: 0.3
            },
            skills: {
                Crafting() {
                    return 20 * (1 + towns[2].getLevel("Mason") / 100);
                }
            },
            affectedBy: ["Crafting Guild"],
            canStart() {
                return guild === "Crafting";
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 40;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 60 && towns[2].getLevel("Apprentice") >= 100;
            },
            finish() {
                towns[2].finishProgress(this.varName, 20 * getCraftGuildRank().bonus);
                handleSkillExp(this.skills);
                view.requestUpdate("adjustExpGain", Action.Mason);
            },
        });
        
        Action.Architect = new Action("Architect", {
            type: "progress",
            expMult: 2.5,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return towns[2].getLevel(this.varName) >= 1;
                    case 2:
                        return towns[2].getLevel(this.varName) >= 10;
                    case 3:
                        return towns[2].getLevel(this.varName) >= 20;
                    case 4:
                        return towns[2].getLevel(this.varName) >= 40;
                    case 5:
                        return towns[2].getLevel(this.varName) >= 60;
                    case 6:
                        return towns[2].getLevel(this.varName) >= 80;
                    case 7:
                        return towns[2].getLevel(this.varName) >= 100;
                }
                return false;
            },
            stats: {
                Dex: 0.2,
                Int: 0.6,
                Cha: 0.2
            },
            skills: {
                Crafting() {
                    return 40 * (1 + towns[2].getLevel("Architect") / 100);
                }
            },
            affectedBy: ["Crafting Guild"],
            canStart() {
                return guild === "Crafting";
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[2].getLevel("Drunk") >= 60;
            },
            unlocked() {
                return towns[2].getLevel("Drunk") >= 80 && towns[2].getLevel("Mason") >= 100;
            },
            finish() {
                towns[2].finishProgress(this.varName, 10 * getCraftGuildRank().bonus);
                handleSkillExp(this.skills);
                view.requestUpdate("adjustExpGain", Action.Architect);
            },
        });
        
        Action.ReadBooks = new Action("Read Books", {
            type: "normal",
            expMult: 4,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1: return storyFlags.booksRead;
                    case 2: return storyFlags.booksRead && getTalent("Int") >= 100;
                    case 3: return storyFlags.booksRead && getTalent("Int") >= 1000;
                    case 4: return storyFlags.booksRead && getTalent("Int") >= 10000;
                    case 5: return storyFlags.booksRead && getTalent("Int") >= 100000;
                }
                return false;
            },
            stats: {
                Int: 0.8,
                Soul: 0.2
            },
            affectedBy: ["Buy Glasses"],
            allowed() {
                return trainingLimits;
            },
            canStart() {
                return resources.glasses;
            },
            manaCost() {
                return 2000;
            },
            visible() {
                return towns[2].getLevel("City") >= 5;
            },
            unlocked() {
                return towns[2].getLevel("City") >= 50;
            },
            finish() {
                setStoryFlag("booksRead");
            },
        });
        
        Action.BuyPickaxe = new Action("Buy Pickaxe", {
            type: "normal",
            expMult: 1,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.pickaxeBought;
                }
                return false;
            },
            stats: {
                Cha: 0.8,
                Int: 0.1,
                Spd: 0.1
            },
            allowed() {
                return 1;
            },
            canStart() {
                return resources.gold >= 200;
            },
            cost() {
                addResource("gold", -200);
            },
            manaCost() {
                return 3000;
            },
            visible() {
                return towns[2].getLevel("City") >= 60;
            },
            unlocked() {
                return towns[2].getLevel("City") >= 90;
            },
            finish() {
                addResource("pickaxe", true);
                setStoryFlag("pickaxeBought");
            },
        });
        
        Action.HeroesTrial = new TrialAction("Heroes Trial", 0, {
            //50 floors
            type: "multipart",
            expMult: 0.2,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return storyFlags.heroTrial1Done;
                    case 2:
                        return storyFlags.heroTrial10Done;
                    case 3:
                        return storyFlags.heroTrial25Done;
                    case 4:
                        return storyFlags.heroTrial50Done;
                }
            },
            varName: "HTrial",
            stats: {
                Dex: 0.11,
                Str: 0.11,
                Con: 0.11,
                Spd: 0.11,
                Per: 0.11,
                Cha: 0.11,
                Int: 0.11,
                Luck: 0.11,
                Soul: 0.11
            },
            skills: {
                Combat: 500,
                Pyromancy: 100,
                Restoration: 100
            },
            loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
            affectedBy: ["Team"],
            baseScaling: 2,
            exponentScaling: 1e8,
            manaCost() {
                return 100000;
            },
            canStart() {
                return this.currentFloor() < trialFloors[this.trialNum];
            },
            baseProgress() {
                return getTeamCombat();
            },
            grantsBuff: "Heroism",
            floorReward() {
                if (this.currentFloor() >= getBuffLevel("Heroism")) addBuffAmt("Heroism", 1, this);
                if (this.currentFloor() >= 1) setStoryFlag("heroTrial1Done");
                if (this.currentFloor() >= 10) setStoryFlag("heroTrial10Done");
                if (this.currentFloor() >= 25) setStoryFlag("heroTrial25Done");
                if (this.currentFloor() >= 50) setStoryFlag("heroTrial50Done");
            },
            visible() {
                return towns[this.townNum].getLevel("Survey") >= 100;
            },
            unlocked() {
                return towns[this.townNum].getLevel("Survey") >= 100;
            },
            finish() {
                handleSkillExp(this.skills);
                view.requestUpdate("updateBuff", "Heroism");
            },
        });
        
        Action.StartTrek = new Action("Start Trek", {
            type: "normal",
            expMult: 2,
            townNum: 2,
            storyReqs(storyNum) {
                switch (storyNum) {
                    case 1:
                        return townsUnlocked.includes(3);
                }
                return false;
            },
            stats: {
                Con: 0.7,
                Per: 0.2,
                Spd: 0.1
            },
            allowed(checkActiveList) {
                return (checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1;
            },
            manaCost() {
                return Math.ceil(12000);
            },
            visible() {
                return towns[2].getLevel("City") >= 30;
            },
            unlocked() {
                return towns[2].getLevel("City") >= 60;
            },
            finish() {
                unlockTown(3);
            },
            story(completed) {
                unlockGlobalStory(5);
            }
        });
        
        Action.Underworld = new Action("Underworld", {
            type: "normal",
            expMult: 1,
            townNum: 2,
            storyReqs(storyNum) {
                switch(storyNum){
                    case 1:
                        return storyFlags.charonPaid;
                }
            },
            stats: {
                Cha: 0.5,
        		Per: 0.5
            },
            allowed() {
                return 1;
            },
            cost() {
                addResource("gold", -500)
            },
            manaCost() {
                return 50000;
            },
            canStart() {
                return resources.gold >= 500;
            },
            visible() {
                return getExploreProgress() > 25;
            },
            unlocked() {
                return getExploreProgress() >= 50;
            },
            goldCost() {
                return 500;
            },
            finish() {
                unlockTown(7);
                setStoryFlag("charonPaid")
            },
        });

        cachedDefinitions = Object.freeze({
            adjustSuckers,
            getAdvGuildRank,
            getCraftGuildRank,
        });

        global.adjustSuckers = adjustSuckers;
        global.getAdvGuildRank = getAdvGuildRank;
        global.getCraftGuildRank = getCraftGuildRank;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerMerchantonActions,
    });
})(globalThis);