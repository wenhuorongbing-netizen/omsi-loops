"use strict";

(function setupValleyOfOlympusActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerValleyOfOlympusActions = function registerValleyOfOlympusActions({Action, MultipartAction, TrialAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

Action.ImbueSoul = new MultipartAction("Imbue Soul", {
    type: "multipart",
    expMult: 5,
    townNum: 8,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.soulInfusionAttempted;
            //Protect these with a check for soulInfusionAttempted, so they don't "finish" instantly
            //on prestige.
            case 2: return storyFlags.soulInfusionAttempted && buffs["Imbuement3"].amt > 0;
            case 3: return storyFlags.soulInfusionAttempted && buffs["Imbuement3"].amt > 6;
            case 4: return storyFlags.soulInfusionAttempted &&
                        buffs["Imbuement"].amt > 499 &&
                        buffs["Imbuement2"].amt > 499 &&
                        buffs["Imbuement3"].amt > 6;
        }
    },
    stats: {
        Soul: 1.0
    },
    loopStats: ["Soul", "Soul", "Soul"],
    manaCost() {
        return 5000000;
    },
    allowed() {
        return 1;
    },
    canStart(loopCounter = towns[8].ImbueSoulLoopCounter) {
        return loopCounter === 0 && getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499 && getBuffLevel("Imbuement3") < 7;
    },
    loopCost(segment) {
        return 100000000 * (segment * 5 + 1);
    },
    tickProgress(offset) {
        return getSkillLevel("Magic");
    },
    grantsBuff: "Imbuement3",
    loopsFinished() {
        for (const stat of globalThis.IdleLoopsCharacterState.resetTalentAndSoulstones(stats, statList)) {
            view.requestUpdate("updateStat", stat);
        }
        globalThis.IdleLoopsCharacterState.resetBuffAmounts(buffs, ["Imbuement", "Imbuement2"]);
        trainingLimits = globalThis.IdleLoopsMetaProgression.resetTrainingLimits();
        addBuffAmt("Imbuement3", 1, this, "imbuement3");
        view.updateBuffs();
        view.updateStats();
        view.requestUpdate("updateSoulstones", null);
    },
    getPartName() {
        return "Imbue Soul";
    },
    visible() {
        return true;
    },
    unlocked() {
        return getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499;
    },
    finish() {
        setStoryFlag("soulInfusionAttempted")
        view.requestUpdate("updateBuff", "Imbuement3");
        capAllTraining();
        adjustTrainingExpMult();
    },
});

Action.BuildTower = new Action("Build Tower", {
    type: "progress",
    progressScaling: "linear",
    expMult: 1,
    townNum: 8,
    storyReqs(storyNum) {
        let buildingProg = towns[this.townNum].expBuildTower / 505;
        switch(storyNum) {
            case 1: return buildingProg >= 1;
            case 2: return buildingProg >= 10;
            case 3: return buildingProg >= 100;
            case 4: return buildingProg >= 250;
            case 5: return buildingProg >= 500;
            case 6: return buildingProg >= 750;
            case 7: return buildingProg >= 999;
        }
    },
    stats: {
        Dex: 0.1,
        Str: 0.3,
        Con: 0.3,
        Per: 0.2,
        Spd: 0.1
    },
    affectedBy: ["Temporal Stone"],
    manaCost() {
        return 250000;
    },
    canStart() {
        return resources.stone;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        stonesUsed = globalThis.IdleLoopsMetaProgression.incrementStoneUse(stonesUsed, stoneLoc);
        towns[this.townNum].finishProgress(this.varName, 505);
        addResource("stone", false);
        if (towns[this.townNum].getLevel(this.varName) >= 100) {
            stonesUsed = globalThis.IdleLoopsMetaProgression.createMaxedStoneUseState();
        }
        adjustRocks(stoneLoc);
    },
});

Action.GodsTrial = new TrialAction("Gods Trial", 1, {
    //100 floors
    type: "multipart",
    expMult: 0.2,
    townNum: 8,
    varName: "GTrial",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.trailGodsFaced;
            case 2: return storyFlags.trailGods10Done;
            case 3: return storyFlags.trailGods20Done;
            case 4: return storyFlags.trailGods30Done;
            case 5: return storyFlags.trailGods40Done;
            case 6: return storyFlags.trailGods50Done;
            case 7: return storyFlags.trailGods60Done;
            case 8: return storyFlags.trailGods70Done;
            case 9: return storyFlags.trailGods80Done;
            case 10: return storyFlags.trailGods90Done;
            case 11: return storyFlags.trailGodsAllDone;
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
    skills: {
        Combat: 250,
        Pyromancy: 50,
        Restoration: 50
    },
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    affectedBy: ["Team"],
    baseScaling: 1.3,
    exponentScaling: 1e7,
    manaCost() {
        return 50000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum] && resources.power < 7;
    },
    baseProgress() {
        return getTeamCombat();
    },
    floorReward() {
        setStoryFlag("trailGodsFaced");
        if (this.currentFloor() >= 10) setStoryFlag("trailGods10Done");
        if (this.currentFloor() >= 20) setStoryFlag("trailGods20Done");
        if (this.currentFloor() >= 30) setStoryFlag("trailGods30Done");
        if (this.currentFloor() >= 40) setStoryFlag("trailGods40Done");
        if (this.currentFloor() >= 50) setStoryFlag("trailGods50Done");
        if (this.currentFloor() >= 60) setStoryFlag("trailGods60Done");
        if (this.currentFloor() >= 70) setStoryFlag("trailGods70Done");
        if (this.currentFloor() >= 80) setStoryFlag("trailGods80Done");
        if (this.currentFloor() >= 90) setStoryFlag("trailGods90Done");

        if (this.currentFloor() === trialFloors[this.trialNum]) //warning: the predictor assumes the old behavior, but this is clearly the intended
        {
            setStoryFlag("trailGodsAllDone");
            addResource("power", 1);
        }
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.ChallengeGods = new TrialAction("Challenge Gods", 2, {
    //7 floors
    type: "multipart",
    expMult: 0.5,
    townNum: 8,
    varName: "GFight",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.fightGods01;
            case 2: return storyFlags.fightGods02;
            case 3: return storyFlags.fightGods03;
            case 4: return storyFlags.fightGods04;
            case 5: return storyFlags.fightGods05;
            case 6: return storyFlags.fightGods06;
            case 7: return storyFlags.fightGods07;
            case 8: return storyFlags.fightGods08;
            case 9: return storyFlags.fightGods09;
            case 10: return storyFlags.fightGods10;
            case 11: return storyFlags.fightGods11;
            case 12: return storyFlags.fightGods12;
            case 13: return storyFlags.fightGods13;
            case 14: return storyFlags.fightGods14;
            case 15: return storyFlags.fightGods15;
            case 16: return storyFlags.fightGods16;
            case 17: return storyFlags.fightGods17;
            case 18: return storyFlags.fightGods18;
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
    skills: {
        Combat: 500,
    },
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    baseScaling: 2,
    exponentScaling: 1e16,
    manaCost() {
        return 50000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum] && resources.power > 0 && resources.power < 8;
    },
    baseProgress() {
        return getSelfCombat();
    },
    floorReward() {
        addResource("power", 1);
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curGodsSegment++;
        //Round 7 is segments 55 through 63
        switch(curGodsSegment) {
            case 1:
                setStoryFlag("fightGods01");
                break;
            case 2:
                setStoryFlag("fightGods03");
                break;
            case 3:
                setStoryFlag("fightGods05");
                break;
            case 4:
                setStoryFlag("fightGods07");
                break;
            case 5:
                setStoryFlag("fightGods09");
                break;
            case 6:
                setStoryFlag("fightGods11");
                break;
            case 7:
                setStoryFlag("fightGods13");
                break;
            case 8:
                setStoryFlag("fightGods15");
                break;
            case 9:
                setStoryFlag("fightGods17");
                break;
            case 55:
                if (getTalent("Dex") > 500000) setStoryFlag("fightGods02");
                break;
            case 56:
                if (getTalent("Str") > 500000) setStoryFlag("fightGods04");
                break;
            case 57:
                if (getTalent("Con") > 500000) setStoryFlag("fightGods06");
                break;
            case 58:
                if (getTalent("Spd") > 500000) setStoryFlag("fightGods08");
                break;
            case 59:
                if (getTalent("Per") > 500000) setStoryFlag("fightGods10");
                break;
            case 60:
                if (getTalent("Cha") > 500000) setStoryFlag("fightGods12");
                break;
            case 61:
                if (getTalent("Int") > 500000) setStoryFlag("fightGods14");
                break;
            case 62:
                if (getTalent("Luck")> 500000) setStoryFlag("fightGods16");
                break;
            case 63:
                if (getTalent("Soul")> 500000) setStoryFlag("fightGods18");
                break;
            default: break;
        }
    },
});

Action.RestoreTime = new Action("Restore Time", {
    type: "normal",
    expMult: 0,
    townNum: 8,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyMax >= 12;
        }
    },
    stats: {
        Luck: 0.5,
        Soul: 0.5,
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 7777777;
    },
    canStart() {
        return resources.power >= 8;
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        addResource("reputation", 9999999);
        completedCurrentGame();
    },
    story(completed) {
        unlockGlobalStory(12);
    }
});

        cachedDefinitions = Object.freeze({});
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerValleyOfOlympusActions,
    });
})(globalThis);
