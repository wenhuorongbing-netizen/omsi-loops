"use strict";

(function setupCommercevilleActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerCommercevilleActions = function registerCommercevilleActions({Action, MultipartAction, TrialAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

Action.Excursion = new Action("Excursion", {
    type: "progress",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("Excursion") >= 1;
            case 2: return towns[7].getLevel("Excursion") >= 10;
            case 3: return towns[7].getLevel("Excursion") >= 25;
            case 4: return towns[7].getLevel("Excursion") >= 40;
            case 5: return towns[7].getLevel("Excursion") >= 60;
            case 6: return towns[7].getLevel("Excursion") >= 80;
            case 7: return towns[7].getLevel("Excursion") >= 100;
            case 8: return storyFlags.excursionAsGuildmember;
        }
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
        return 25000;
    },
    canStart() {
        return resources.gold >= this.goldCost();
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    goldCost() {
        return (guild === "Thieves" || guild === "Explorer") ? 2 : 10;
    },
    finish() {
        if (guild === "Thieves" || guild === "Explorer") setStoryFlag("excursionAsGuildmember");
        towns[7].finishProgress(this.varName, 50 * (resources.glasses ? 2 : 1));
        addResource("gold", -1 * this.goldCost());
    }
});
Action.ExplorersGuild = new Action("Explorers Guild", {
    //Note: each time the 'survey' action is performed, one 'map' is exchanged for a
    //'completed map'; not just when a zone is 100% surveyed.
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.explorerGuildTestTaken;
            case 2: return storyFlags.mapTurnedIn;
            case 3: return fullyExploredZones() >= 1;
            case 4: return fullyExploredZones() >= 4;
            case 5: return fullyExploredZones() >= towns.length;
        }
    },
    stats: {
        Per: 0.3,
        Cha: 0.3,
        Int: 0.2,
        Luck: 0.2
    },
    manaCost() {
        return 65000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "";
    },
    visible() {
        return towns[7].getLevel("Excursion") >= 5;
    },
    unlocked() {
        return towns[7].getLevel("Excursion") >= 10;
    },
    finish() {
        setStoryFlag("explorerGuildTestTaken");
        if (getExploreSkill() == 0) towns[this.townNum].finishProgress("SurveyZ"+this.townNum, 100);
        if (resources.map === 0) addResource("map", 30);
        if (resources.completedMap > 0) {
            exchangeMap();
            setStoryFlag("mapTurnedIn");
        }
        guild = "Explorer";
        view.requestUpdate("adjustGoldCost", {varName: "Excursion", cost: Action.Excursion.goldCost()});
    }
});
Action.ThievesGuild = new MultipartAction("Thieves Guild", {
    type: "multipart",
    expMult: 2,
    townNum: 7,
    varName: "ThievesGuild",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.thiefGuildTestsTaken;
            case 2: return storyFlags.thiefGuildRankEReached;
            case 3: return storyFlags.thiefGuildRankDReached;
            case 4: return storyFlags.thiefGuildRankCReached;
            case 5: return storyFlags.thiefGuildRankBReached;
            case 6: return storyFlags.thiefGuildRankAReached;
            case 7: return storyFlags.thiefGuildRankSReached;
            case 8: return storyFlags.thiefGuildRankUReached;
            case 9: return storyFlags.thiefGuildRankGodlikeReached;
        }
    },
    stats: {
        Dex: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Thievery: 50,
        Practical: 50
    },
    loopStats: ["Per", "Dex", "Spd"],
    manaCost() {
        return 75000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "" && resources.reputation < 0;
    },
    loopCost(segment, loopCounter = towns[7][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.2, loopCounter + segment)) * 5e8;
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[7][`total${this.varName}`]) {
        return (getSkillLevel("Practical") +
                getSkillLevel("Thievery")) *
                Math.sqrt(1 + totalCompletions / 1000);
    },
    loopsFinished() {
    },
    segmentFinished() {
        curThievesGuildSegment++;
        handleSkillExp(this.skills);
        addResource("gold", 10);
    },
    getPartName() {
        return `Rank ${getThievesGuildRank().name}`;
    },
    getSegmentName(segment) {
        return `Rank ${getThievesGuildRank(segment % 3).name}`;
    },
    visible() {
        return towns[7].getLevel("Excursion") >= 20;
    },
    unlocked() {
        return towns[7].getLevel("Excursion") >= 25;
    },
    finish() {
        guild = "Thieves";
        view.requestUpdate("adjustGoldCost", {varName: "Excursion", cost: Action.Excursion.goldCost()});
        handleSkillExp(this.skills);
        setStoryFlag("thiefGuildTestsTaken");
        if (curThievesGuildSegment >= 3) setStoryFlag("thiefGuildRankEReached");
        if (curThievesGuildSegment >= 6) setStoryFlag("thiefGuildRankDReached");
        if (curThievesGuildSegment >= 9) setStoryFlag("thiefGuildRankCReached");
        if (curThievesGuildSegment >= 12) setStoryFlag("thiefGuildRankBReached");
        if (curThievesGuildSegment >= 15) setStoryFlag("thiefGuildRankAReached");
        if (curThievesGuildSegment >= 18) setStoryFlag("thiefGuildRankSReached");
        if (curThievesGuildSegment >= 30) setStoryFlag("thiefGuildRankUReached");
        if (curThievesGuildSegment >= 42) setStoryFlag("thiefGuildRankGodlikeReached");
    },
});
function getThievesGuildRank(offset) {
    let name = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "SSSS", "U", "UU", "UUU", "UUUU"][Math.floor(curThievesGuildSegment / 3 + 0.00001)];

    const segment = (offset === undefined ? 0 : offset - (curThievesGuildSegment % 3)) + curThievesGuildSegment;
    let bonus = precision3(1 + segment / 20 + Math.pow(segment, 2) / 300);
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curThievesGuildSegment % 3];
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

Action.PickPockets = new Action("Pick Pockets", {
    type: "progress",
    expMult: 1.5,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("PickPockets") >= 1;
            case 2: return towns[7].getLevel("PickPockets") >= 10;
            case 3: return towns[7].getLevel("PickPockets") >= 20;
            case 4: return towns[7].getLevel("PickPockets") >= 40;
            case 5: return towns[7].getLevel("PickPockets") >= 60;
            case 6: return towns[7].getLevel("PickPockets") >= 80;
            case 7: return towns[7].getLevel("PickPockets") >= 100;
        }
    },
    stats: {
        Dex: 0.4,
        Spd: 0.4,
        Luck: 0.2
    },
    skills: {
        Thievery() {
            return 10 * (1 + towns[7].getLevel("PickPockets") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalPockets;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 20000;
    },
    visible() {
        return getSkillLevel("Thievery") > 0;
    },
    unlocked() {
        return getSkillLevel("Thievery") > 0;
    },
    goldCost() {
        return Math.floor(2 * getSkillBonus("Thievery"));
    },
    finish() {
        towns[7].finishProgress(this.varName, 30 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.RobWarehouse = new Action("Rob Warehouse", {
    type: "progress",
    expMult: 2,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("RobWarehouse") >= 1;
            case 2: return towns[7].getLevel("RobWarehouse") >= 10;
            case 3: return towns[7].getLevel("RobWarehouse") >= 20;
            case 4: return towns[7].getLevel("RobWarehouse") >= 40;
            case 5: return towns[7].getLevel("RobWarehouse") >= 60;
            case 6: return towns[7].getLevel("RobWarehouse") >= 80;
            case 7: return towns[7].getLevel("RobWarehouse") >= 100;
        }
    },
    stats: {
        Dex: 0.4,
        Spd: 0.2,
        Int: 0.2,
        Luck: 0.2
    },
    skills: {
        Thievery() {
            return 20 * (1 + towns[7].getLevel("RobWarehouse") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalWarehouses;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return towns[7].getLevel("PickPockets") >= 25;
    },
    unlocked() {
        return towns[7].getLevel("PickPockets") >= 100;
    },
    goldCost() {
        return Math.floor(20 * getSkillBonus("Thievery"));
        },
    finish() {
        towns[7].finishProgress(this.varName, 20 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.InsuranceFraud = new Action("Insurance Fraud", {
    type: "progress",
    expMult: 2.5,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("InsuranceFraud") >= 1;
            case 2: return towns[7].getLevel("InsuranceFraud") >= 10;
            case 3: return towns[7].getLevel("InsuranceFraud") >= 20;
            case 4: return towns[7].getLevel("InsuranceFraud") >= 40;
            case 5: return towns[7].getLevel("InsuranceFraud") >= 60;
            case 6: return towns[7].getLevel("InsuranceFraud") >= 75;
            case 7: return towns[7].getLevel("InsuranceFraud") >= 100;
        }
    },
    stats: {
        Dex: 0.2,
        Spd: 0.2,
        Int: 0.3,
        Luck: 0.3
    },
    skills: {
        Thievery() {
            return 40 * (1 + towns[7].getLevel("InsuranceFraud") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalInsurance;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 100000;
    },
    visible() {
        return towns[7].getLevel("RobWarehouse") >= 50;
    },
    unlocked() {
        return towns[7].getLevel("RobWarehouse") >= 100;
    },
    goldCost() {
        return Math.floor(200 * getSkillBonus("Thievery"));
    },
    finish() {
        towns[7].finishProgress(this.varName, 10 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.GuildAssassin = new Action("Guild Assassin", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Assassin") > 0;
            case 2: return storyFlags.assassinHeartDelivered;
            case 3: return totalAssassinations() >= 4;
            case 4: return storyFlags.assassin4HeartsDelivered;
            case 5: return totalAssassinations() >= 8;
            case 6: return storyFlags.assassin8HeartsDelivered;
        }
    },
    stats: {
        Per: 0.1,
        Cha: 0.3,
        Dex: 0.4,
        Luck: 0.2
    },
    skills: {
        Assassin: 100
    },
    manaCost() {
        return 100000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "";
    },
    visible() {
        return towns[this.townNum].getLevel("InsuranceFraud") >= 75;
    },
    unlocked() {
        return towns[this.townNum].getLevel("InsuranceFraud") >= 100;
    },
    finish() {
        if (resources.heart >= 1) setStoryFlag("assassinHeartDelivered");
        if (resources.heart >= 4) setStoryFlag("assassin4HeartsDelivered");
        if (resources.heart >= 8) setStoryFlag("assassin8HeartsDelivered");
        let assassinExp = 0;
        if (getSkillLevel("Assassin") === 0) assassinExp = 100;
        if (resources.heart > 0) assassinExp = 100 * Math.pow(resources.heart, 2);
        this.skills.Assassin = assassinExp;
        handleSkillExp(this.skills);
        globalThis.IdleLoopsResourceState.setResourceValue(resources, "heart", 0);
        guild = "Assassin";
    }
});

function totalAssassinations(){
    //Counts all zones with at least one successful assassination.
    let total = 0;
    for (var i = 0; i < towns.length; i++)
    {
        if (towns[i][`totalAssassinZ${i}`] > 0) total++
    }
    return total;
}

Action.Invest = new Action("Invest", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.investedOne;
            case 2: return storyFlags.investedTwo;
            case 3: return goldInvested >= 1000000;
            case 4: return goldInvested >= 1000000000;
            case 5: return goldInvested == 999999999999;
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Mercantilism: 100
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 50000;
    },
    canStart() {
        return resources.gold > 0;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");

        //Looks like something (maybe very high accelerations?) can give you a gold value of NaN.  If so, don't corrupt
        //the save file
        if (isFinite(resources.gold))
        {
            goldInvested = globalThis.IdleLoopsMetaProgression.addGoldInvestment(goldInvested, resources.gold);

            //Don't reset the gold value if it's NaN.  This should make it a bit easier to see what went wrong.
            resetResource("gold");
        }
        if (storyFlags.investedOne) setStoryFlag("investedTwo");
        setStoryFlag("investedOne");
        view.requestUpdate("updateActionTooltips", null);
    },
});

Action.CollectInterest = new Action("Collect Interest", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.interestCollected;
            case 2: return storyFlags.collected1KInterest;
            case 3: return storyFlags.collected1MInterest;
            case 4: return storyFlags.collectedMaxInterest;
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Mercantilism: 50
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
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");

        let interestGold = Math.floor(goldInvested * .001);
        addResource("gold", interestGold);
        setStoryFlag("interestCollected");
        if (interestGold >= 1000) setStoryFlag("collected1KInterest");
        if (interestGold >= 1000000) setStoryFlag("collected1MInterest");
        if (interestGold >= 999999999) setStoryFlag("collectedMaxInterest");
        return interestGold;
    },
});

Action.Seminar = new Action("Seminar", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.seminarAttended;
            case 2: return storyFlags.leadership10;
            case 3: return storyFlags.leadership100;
            case 4: return storyFlags.leadership1k;
        }
    },
    stats: {
        Cha: 0.8,
        Luck: 0.1,
        Soul: 0.1
    },
    skills: {
        Leadership: 200
    },
    manaCost() {
        return 20000;
    },
    canStart() {
        return resources.gold >= 1000;
    },
    cost() {
        addResource("gold", -1000);
    },
    visible() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    goldCost() {
        return 1000;
    },
    finish() {
        handleSkillExp(this.skills);
        let leadershipLevel = getSkillLevel("Leadership");
        if (leadershipLevel >= 10) setStoryFlag("leadership10");
        if (leadershipLevel >= 100) setStoryFlag("leadership100");
        if (leadershipLevel >= 1000) setStoryFlag("leadership1k");
        setStoryFlag("seminarAttended");
    },
});

Action.PurchaseKey = new Action("Purchase Key", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.keyBought;
        }
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
        return 20000;
    },
    canStart() {
        return resources.gold >= 1000000 && !resources.key;
    },
    cost() {
        addResource("gold", -1000000);
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    goldCost() {
        return 1000000;
    },
    finish() {
        addResource("key", true);
        setStoryFlag("keyBought");
    },
});

Action.SecretTrial = new TrialAction("Secret Trial", 3, {
    //1000 floors
    type: "multipart",
    expMult: 0,
    townNum: 7,
    varName: "STrial",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.trailSecretFaced;
            case 2: return storyFlags.trailSecret1Done;
            case 3: return storyFlags.trailSecret10Done;
            case 4: return storyFlags.trailSecret100Done;
            case 5: return storyFlags.trailSecret500Done;
            case 6: return storyFlags.trailSecretAllDone;
        }
    },
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
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    affectedBy: ["Team"],
    baseScaling: 1.25,
    exponentScaling: 1e10,
    manaCost() {
        return 100000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum];
    },
    baseProgress() {
        return getTeamCombat();
    },
    floorReward() {
        //None
    },
    visible() {
        return storyMax >= 12 && getBuffLevel("Imbuement3") >= 7;
    },
    unlocked() {
        return storyMax >= 12 && getBuffLevel("Imbuement3") >= 7;
    },
    finish() {
        setStoryFlag("trailSecretFaced");
        let floor = this.currentFloor();
        if (floor >= 1) setStoryFlag("trailSecret1Done");
        if (floor >= 10) setStoryFlag("trailSecret10Done");
        if (floor >= 100) setStoryFlag("trailSecret100Done");
        if (floor >= 500) setStoryFlag("trailSecret500Done");
        if (floor == 1000) setStoryFlag("trailSecretAllDone");
    },
});

Action.LeaveCity = new Action("Leave City", {
    type: "normal",
    expMult: 2,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(8);
        }
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
        return 100000;
    },
    cost() {
        addResource("key", false);
    },
    canStart() {
        return resources.key;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        unlockTown(8);
    },
    story(completed) {
        unlockGlobalStory(11);
    }
});

        cachedDefinitions = Object.freeze({
            getThievesGuildRank,
            totalAssassinations
        });

        global.getThievesGuildRank = getThievesGuildRank;
        global.totalAssassinations = totalAssassinations;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerCommercevilleActions,
    });
})(globalThis);
