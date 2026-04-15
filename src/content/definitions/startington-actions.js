"use strict";

(function setupStartingtonActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerStartingtonActions = function registerStartingtonActions({Action, MultipartAction, DungeonAction, TrialAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

Action.Meander = new Action("Meander", {
    type: "progress",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[5].getLevel("Meander") >= 1;
            case 2: return towns[5].getLevel("Meander") >= 2;
            case 3: return towns[5].getLevel("Meander") >= 5;
            case 4: return towns[5].getLevel("Meander") >= 15;
            case 5: return towns[5].getLevel("Meander") >= 25;
            case 6: return towns[5].getLevel("Meander") >= 50;
            case 7: return towns[5].getLevel("Meander") >= 75;
            case 8: return towns[5].getLevel("Meander") >= 100;
            case 9: return storyFlags.meanderIM100;
        }
    },
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    affectedBy: ["Imbue Mind"],
    manaCost() {
        return 2500;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        if (getBuffLevel("Imbuement") >= 100) setStoryFlag("meanderIM100");
        towns[5].finishProgress(this.varName, getBuffLevel("Imbuement"));
    }
});
Action.ManaWell = new Action("Mana Well", {
    type: "limited",
    expMult: 1,
    townNum: 5,
    varName: "Wells",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.wellDrawn;
            case 2: return storyFlags.drew10Wells;
            case 3: return storyFlags.drew15Wells;
            case 4: return storyFlags.drewDryWell;
        }
    },
    stats: {
        Str: 0.6,
        Per: 0.3,
        Int: 0.1,
    },
    manaCost() {
        return Math.ceil(2500 * getSkillBonus("Spatiomancy"));
    },
    canStart() {
        return true;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 2;
    },
    goldCost() { // in this case, "amount of mana in well"
        return Math.max(5000 - Math.floor(10 * effectiveTime), 0);
    },
    finish() {
        towns[5].finishRegular(this.varName, 100, () => {
        let wellMana = this.goldCost();
        addMana(wellMana);
        if (wellMana === 0)
            setStoryFlag("drewDryWell");
        else
            setStoryFlag("wellDrawn");
        return wellMana;
        });
        if (towns[5].goodWells >= 10) setStoryFlag("drew10Wells");
        if (towns[5].goodWells >= 15) setStoryFlag("drew15Wells");
    },
});
Action.DestroyPylons = new Action("Destroy Pylons", {
    type: "limited",
    expMult: 1,
    townNum: 5,
    varName: "Pylons",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[5].goodPylons >= 1;
            case 2: return towns[5].goodPylons >= 10;
            case 3: return towns[5].goodPylons >= 25;
        }
    },
    stats: {
        Str: 0.4,
        Dex: 0.3,
        Int: 0.3
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 1;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 5;
    },
    finish() {
        towns[5].finishRegular(this.varName, 100, () => {
            addResource("pylons", 1);
            //view.requestUpdate("adjustManaCost", "The Spire");
            return 1;
        });
    },
});

Action.RaiseZombie = new Action("Raise Zombie", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.attemptedRaiseZombie;
            case 3: return storyVars.maxZombiesRaised >= 10;
            case 4: return storyVars.maxZombiesRaised >= 25;
        }
    },
    stats: {
        Con: 0.4,
        Int: 0.3,
        Soul: 0.3
    },
    skills: {
        Dark: 100
    },
    canStart() {
        return resources.blood >= 1;
    },
    cost() {
        addResource("blood", -1);
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 15;
    },
    unlocked() {
        return getSkillLevel("Dark") >= 1000;
    },
    finish() {
        setStoryFlag("attemptedRaiseZombie");
        handleSkillExp(this.skills);
        addResource("zombie", 1);
        increaseStoryVarTo("maxZombiesRaised", resources.zombie);
    },
});

Action.DarkSacrifice = new Action("Dark Sacrifice", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Commune") >= 1;
            case 2: return getSkillLevel("Commune") >= 100;
            case 3: return getSkillLevel("Commune") >= 1000;
        }
    },
    stats: {
        Int: 0.2,
        Soul: 0.8
    },
    skills: {
        Commune: 100
    },
    canStart() {
        return resources.blood >= 1;
    },
    cost() {
        addResource("blood", -1);
    },
    manaCost() {
        return 20000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 25;
    },
    unlocked() {
        return getBuffLevel("Ritual") >= 60;
    },
    finish() {
        handleSkillExp(this.skills);
        view.requestUpdate("adjustGoldCost", {varName: "DarkRitual", cost: Action.DarkRitual.goldCost()});
    },
});

Action.TheSpire = new DungeonAction("The Spire", 2, {
    type: "multipart",
    expMult: 1,
    townNum: 5,
    varName: "TheSpire",
    storyReqs(storyNum) {
        switch(storyNum) {
            //TODO: decide on some reasonable/better floor requirements for progress stories.
            case 1: return storyFlags.spireAttempted;
            case 2: return towns[5].totalTheSpire >= 1000;
            case 3: return towns[5].totalTheSpire >= 5000;
            case 4: return storyFlags.clearedSpire;
            case 5: return storyFlags.spire10Pylons;
            case 6: return storyFlags.spire20Pylons;
        }
    },
    stats: {
        Str: 0.1,
        Dex: 0.1,
        Spd: 0.1,
        Con: 0.1,
        Per: 0.2,
        Int: 0.2,
        Soul: 0.2
    },
    skills: {
        Combat: 100
    },
    loopStats: ["Per", "Int", "Con", "Spd", "Dex", "Per", "Int", "Str", "Soul"],
    affectedBy: ["Team"],
    manaCost() {
        return 100000;
    },
    canStart(loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001);
        return curFloor < dungeons[this.dungeonNum].length;
    },
    loopCost(segment, loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        return precision3(Math.pow(2, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 1e7);
    },
    tickProgress(_offset, loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const floor = Math.floor((loopCounter) / this.segments + 0.0000001);
        return getTeamCombat() * (1 + 0.1 * resources.pylons) *
        Math.sqrt(1 + dungeons[this.dungeonNum][floor].completed / 200);
    },
    grantsBuff: "Aspirant",
    loopsFinished(loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001 - 1);
        this.finishDungeon(curFloor);
        if (curFloor >= getBuffLevel("Aspirant")) addBuffAmt("Aspirant", 1, this);
        if (curFloor == dungeonFloors[this.dungeonNum]-1) setStoryFlag("clearedSpire");
    },
    visible() {
        return towns[5].getLevel("Meander") >= 5;
    },
    unlocked() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    },
    finish() {
        handleSkillExp(this.skills);
        view.requestUpdate("updateBuff", "Aspirant");
        setStoryFlag("spireAttempted")
        if (resources.pylons >= 10) setStoryFlag("spire10Pylons");
        if (resources.pylons >= 25) setStoryFlag("spire20Pylons");
    },
});

Action.PurchaseSupplies = new Action("Purchase Supplies", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
                case 1: return storyFlags.suppliesPurchased;
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
        return 2000;
    },
    canStart() {
        return resources.gold >= 500 && !resources.supplies;
    },
    cost() {
        addResource("gold", -500);
    },
    visible() {
        return towns[5].getLevel("Meander") >= 50;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 75;
    },
    finish() {
        setStoryFlag("suppliesPurchased")
        addResource("supplies", true);
    },
});

Action.DeadTrial = new TrialAction("Dead Trial", 4, {
    //25 floors
    type: "multipart",
    expMult: 0.25,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.deadTrial1Done;
            case 2: return storyFlags.deadTrial10Done;
            case 3: return storyFlags.deadTrial25Done;
        }
    },
    stats: {
        Cha: 0.25,
        Int: 0.25,
        Luck: 0.25,
        Soul: 0.25
    },
    loopStats: ["Cha", "Int", "Luck", "Soul"],
    affectedBy: ["RaiseZombie"],
    baseScaling: 2, //Difficulty is raised to this exponent each floor
    exponentScaling: 1e9, //Difficulty is multiplied by this number each floor
    manaCost() {
        return 100000;
    },
    baseProgress() {
        //Determines what skills give progress to the trial
        return getZombieStrength();
    },
    floorReward() {
        //Rewards given per floor
        addResource("zombie", 1);
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum];
    },
    visible() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    finish() {
        if (this.currentFloor() >= 1) setStoryFlag("deadTrial1Done");
        if (this.currentFloor() >= 10) setStoryFlag("deadTrial10Done");
        if (this.currentFloor() >= 25) setStoryFlag("deadTrial25Done");
    },
});

Action.JourneyForth = new Action("Journey Forth", {
    type: "normal",
    expMult: 2,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(6);
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    allowed(checkActiveList) {
        return (checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1;
    },
    manaCost() {
        return 20000;
    },
    canStart() {
        return resources.supplies;
    },
    cost() {
        addResource("supplies", false);
    },
    visible() {
        return towns[5].getLevel("Meander") >= 75;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 100;
    },
    finish() {
        unlockTown(6);
    },
    story(completed) {
        unlockGlobalStory(8);
    }
});

        cachedDefinitions = Object.freeze({});
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerStartingtonActions,
    });
})(globalThis);
