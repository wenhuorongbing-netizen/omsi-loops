"use strict";

(function setupJunglePathActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerJunglePathActions = function registerJunglePathActions({Action, MultipartAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

Action.ExploreJungle = new Action("Explore Jungle", {
    type: "progress",
    expMult: 1,
    townNum: 6,
    varName: "ExploreJungle",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[6].getLevel(this.varName) >= 1;
            case 2: return towns[6].getLevel(this.varName) >= 10;
            case 3: return towns[6].getLevel(this.varName) >= 20;
            case 4: return towns[6].getLevel(this.varName) >= 40;
            case 5: return towns[6].getLevel(this.varName) >= 50;
            case 6: return towns[6].getLevel(this.varName) >= 60;
            case 7: return towns[6].getLevel(this.varName) >= 80;
            case 8: return towns[6].getLevel(this.varName) >= 100;
        }
    },
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    affectedBy: ["Fight Jungle Monsters"],
    manaCost() {
        return 25000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[6].finishProgress(this.varName, 20 * getFightJungleMonstersRank().bonus);
        addResource("herbs", 1);
    }
});

Action.FightJungleMonsters = new MultipartAction("Fight Jungle Monsters", {
    type: "multipart",
    expMult: 1,
    townNum: 6,
    varName: "FightJungleMonsters",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.monsterGuildTestTaken;
            case 2: return storyFlags.monsterGuildRankDReached;
            case 3: return storyFlags.monsterGuildRankCReached;
            case 4: return storyFlags.monsterGuildRankBReached;
            case 5: return storyFlags.monsterGuildRankAReached;
            case 6: return storyFlags.monsterGuildRankSReached;
            case 7: return storyFlags.monsterGuildRankSSReached;
            case 8: return storyFlags.monsterGuildRankSSSReached;
            case 9: return storyFlags.monsterGuildRankUReached;
            case 10: return storyFlags.monsterGuildRankGodlikeReached;
        }
    },
    stats: {
        Str: 0.3,
        Dex: 0.3,
        Per: 0.4,
    },
    skills: {
        Combat: 2000
    },
    loopStats: ["Dex", "Str", "Per"],
    manaCost() {
        return 30000;
    },
    canStart() {
        return true;
    },
    loopCost(segment, loopCounter = towns[6][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e8; // Temp
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[6][`total${this.varName}`]) {
        return (getSelfCombat() *
            Math.sqrt(1 + totalCompletions / 1000));
    },
    loopsFinished() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curFightJungleMonstersSegment++;
        addResource("blood", 1);
        //Since the action stories are for having *slain* the beast,
        //unlock *after* the last segment of the beast in question.
        //I.e., the sloth fight is segments 6, 7 and 8, so the unlock
        //happens when the 8th segment is done and the current segment
        //is 9 or more.
        if (curFightJungleMonstersSegment >= 9) setStoryFlag("monsterGuildRankDReached");
        if (curFightJungleMonstersSegment >= 15) setStoryFlag("monsterGuildRankCReached");
        if (curFightJungleMonstersSegment >= 21) setStoryFlag("monsterGuildRankBReached");
        if (curFightJungleMonstersSegment >= 27) setStoryFlag("monsterGuildRankAReached");
        if (curFightJungleMonstersSegment >= 33) setStoryFlag("monsterGuildRankSReached");
        if (curFightJungleMonstersSegment >= 39) setStoryFlag("monsterGuildRankSSReached");
        if (curFightJungleMonstersSegment >= 45) setStoryFlag("monsterGuildRankSSSReached");
        if (curFightJungleMonstersSegment >= 51) setStoryFlag("monsterGuildRankUReached");
        if (curFightJungleMonstersSegment >= 57) setStoryFlag("monsterGuildRankGodlikeReached");
        // Additional thing?
    },
    getPartName() {
        return `${getFightJungleMonstersRank().name}`;
    },
    getSegmentName(segment) {
        return `${getFightJungleMonstersRank(segment % 3).name}`;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        setStoryFlag("monsterGuildTestTaken");
    },
});
function getFightJungleMonstersRank(offset) {
    let name = [
        "Frog",
        "Toucan",
        "Sloth",     //D
        "Pangolin",
        "Python",    //C
        "Tapir",
        "Okapi",     //B
        "Bonobo",
        "Jaguar",    //A
        "Chimpanzee",
        "Annaconda", //S
        "Lion",
        "Tiger",     //SS
        "Bear",
        "Crocodile", //SSS
        "Rhino",
        "Gorilla",   //U
        "Hippo",
        "Elephant"   //godlike
    ][Math.floor(curFightJungleMonstersSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curFightJungleMonstersSegment % 3)) + curFightJungleMonstersSegment;
    let bonus = precision3(1 + 0.05 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curFightJungleMonstersSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Stampede";
        bonus = 10;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.RescueSurvivors = new MultipartAction("Rescue Survivors", {
    type: "multipart",
    expMult: 1,
    townNum: 6,
    varName: "Rescue",
    storyReqs(storyNum) {
        switch(storyNum) {
                case 1: return storyFlags.survivorRescued;
                case 2: return storyFlags.rescued6Survivors;
                case 3: return storyFlags.rescued20Survivors;
        }
    },
    stats: {
        Per: 0.4,
        Dex: 0.2,
        Cha: 0.2,
        Spd: 0.2
    },
    skills: {
        Restoration: 25
    },
    loopStats: ["Per", "Spd", "Cha"],
    manaCost() {
        return 25000;
    },
    canStart() {
        return true;
    },
    loopCost(segment, loopCounter = towns[6].RescueLoopCounter) {
        return fibonacci(2 + Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 5000;
    },
    tickProgress(offset, loopCounter, totalCompletions = towns[6].totalRescue) {
        return getSkillLevel("Magic") * Math.max(getSkillLevel("Restoration") / 100, 1) * Math.sqrt(1 + totalCompletions / 100);
    },
    loopsFinished(loopCounter = towns[6].RescueLoopCounter) {
        addResource("reputation", 4);
        setStoryFlag("survivorRescued");
        if (loopCounter >= 6*3) setStoryFlag("rescued6Survivors");
        if (loopCounter >= 20*3) setStoryFlag("rescued20Survivors");
    },
    getPartName(loopCounter = towns[6].RescueLoopCounter) {
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${numberToWords(Math.floor((loopCounter + 0.0001) / this.segments + 1))}`;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 10;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 20;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.PrepareBuffet = new Action("Prepare Buffet", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.buffetHeld;
            case 2: return storyFlags.buffetFor1;
            case 3: return storyFlags.buffetFor6;
            case 4: return getSkillLevel("Gluttony") >= 10;
            case 5: return getSkillLevel("Gluttony") >= 100;
        }
    },
    stats: {
        Con: 0.3,
        Per: 0.1,
        Int: 0.6
    },
    skills: {
        Alchemy: 25,
        Gluttony: 5
    },
    canStart() {
        return resources.herbs >= 10 && resources.blood > 0;
    },
    cost() {
        addResource("herbs", -10);
        addResource("blood", -1);
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 15;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 20;
    },
    finish() {
        // @ts-ignore
        this.skills.Gluttony = Math.floor(towns[6].RescueLoopCounter * 5);
        handleSkillExp(this.skills);
        setStoryFlag("buffetHeld");
        if (towns[6].RescueLoopCounter >= 1) setStoryFlag("buffetFor1");
        if (towns[6].RescueLoopCounter >= 6) setStoryFlag("buffetFor6");
    },
});

Action.Totem = new Action("Totem", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Wunderkind") >= 1;
            case 2: return getSkillLevel("Wunderkind") >= 5;
            case 3: return getSkillLevel("Wunderkind") >= 60;
            case 4: return getSkillLevel("Wunderkind") >= 360;
        }
    },
    stats: {
        Con: 0.3,
        Per: 0.2,
        Soul: 0.5
    },
    skills: {
        Wunderkind: 100
    },
    canStart() {
        return resources.loopingPotion;
    },
    cost() {
        addResource("loopingPotion", false);
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 25;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 50;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.Escape = new Action("Escape", {
    type: "normal",
    expMult: 2,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(7);
        }
    },
    stats: {
        Dex: 0.2,
        Spd: 0.8
    },
    allowed() {
        return 1;
    },
    canStart() {
        if (escapeStarted) return true;
        else if (effectiveTime < 60) {
            escapeStarted = true;
            return true;
        }
        else return false;
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 75;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 100;
    },
    finish() {
        unlockTown(7);
    },
    story(completed) {
        //FIXME: This will (unfortunately) give the story completion for creating the looping potion, even
        //if the player didn't, because completing story N will also complete all stories less than N.
        unlockGlobalStory(10);
    },
});

Action.OpenPortal = new Action("Open Portal", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.portalOpened;
        }
    },
    stats: {
        Int: 0.2,
        Luck: 0.1,
        Soul: 0.7
    },
    skills: {
        Restoration: 2500
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return getExploreProgress() > 50;
    },
    unlocked() {
        return getExploreProgress() >= 75 && getSkillLevel("Restoration") >= 1000;
    },
    canStart() {
        return getSkillLevel("Restoration") >= 1000;
    },
    finish() {
        portalUsed = true;
        setStoryFlag("portalOpened");
        handleSkillExp(this.skills);
        unlockTown(1);
    },
});

        cachedDefinitions = Object.freeze({
            getFightJungleMonstersRank,
        });

        global.getFightJungleMonstersRank = getFightJungleMonstersRank;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerJunglePathActions,
    });
})(globalThis);
