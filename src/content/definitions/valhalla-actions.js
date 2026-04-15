"use strict";

(function setupValhallaActionDefinitions(global) {
    let cachedDefinitions = null;

    const existingFactories = global.IdleLoopsZoneDefinitionFactories ?? {};
    const registerValhallaActions = function registerValhallaActions({Action, MultipartAction}) {
        if (cachedDefinitions) {
            return cachedDefinitions;
        }

Action.GuidedTour = new Action("Guided Tour", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Tour",
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[4].getLevel(this.varName) >= 1;
            case 2:
                return towns[4].getLevel(this.varName) >= 10;
            case 3:
                return towns[4].getLevel(this.varName) >= 20;
            case 4:
                return towns[4].getLevel(this.varName) >= 30;
            case 5:
                return towns[4].getLevel(this.varName) >= 40;
            case 6:
                return towns[4].getLevel(this.varName) >= 60;
            case 7:
                return towns[4].getLevel(this.varName) >= 80;
            case 8:
                return towns[4].getLevel(this.varName) >= 90;
            case 9:
                return towns[4].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per: 0.3,
        Con: 0.2,
        Cha: 0.3,
        Int: 0.1,
        Luck: 0.1
    },
	affectedBy: ["Buy Glasses"],
    canStart() {
        return resources.gold >= 10;
    },
    cost() {
        addResource("gold", -10);
    },
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
        towns[4].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
    },
});

Action.Canvass = new Action("Canvass", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Canvassed",
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[4].getLevel(this.varName) >= 5;
            case 2:
                return towns[4].getLevel(this.varName) >= 15;
            case 3:
                return towns[4].getLevel(this.varName) >= 30;
            case 4:
                return towns[4].getLevel(this.varName) >= 50;
            case 5:
                return towns[4].getLevel(this.varName) >= 75;
            case 6:
                return towns[4].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Con: 0.1,
        Cha: 0.5,
        Spd: 0.2,
        Luck: 0.2
    },
    manaCost() {
        return 4000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 10;
    },
    finish() {
        towns[4].finishProgress(this.varName, 50);
    },
});

Action.Donate = new Action("Donate", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return storyFlags.donatedToCharity;
        }
        return false;
    },
    stats: {
        Per: 0.2,
        Cha: 0.2,
        Spd: 0.2,
        Int: 0.4,
    },
    canStart() {
        return resources.gold >= 20;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Canvassed") >= 5;
    },
    finish() {
        addResource("gold", -20);
        addResource("reputation", 1);
        setStoryFlag("donatedToCharity");
    },
});

Action.AcceptDonations = new Action("Accept Donations", {
    type: "limited",
    expMult: 1,
    townNum: 4,
    varName: "Donations",
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.receivedDonation;
            case 2: return towns[4][`good${this.varName}`] >= 1;
            case 3: return towns[4][`good${this.varName}`] >= 100;
            case 4: return towns[4][`good${this.varName}`] >= 250;
            case 5: return storyFlags.failedReceivedDonation;
        }
    },
    stats: {
        Con: 0.1,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.4
    },
    canStart() {
        return resources.reputation > 0;
    },
    cost() {
        addResource("reputation", -1);
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Canvassed") >= 5;
    },
    finish() {
        setStoryFlag("receivedDonation");
        towns[4].finishRegular(this.varName, 5, () => {
            addResource("gold", 20);
            return 20;
        });
    },
});

Action.TidyUp = new MultipartAction("Tidy Up", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "Tidy",
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.tidiedUp;
            case 5: return towns[4].totalTidy >= 100;
            case 6: return towns[4].totalTidy >= 1000;
            case 7: return towns[4].totalTidy >= 10000;
        }
    },
    stats: {
        Spd: 0.3,
        Dex: 0.3,
        Str: 0.2,
        Con: 0.2,
    },
    loopStats: ["Str", "Dex", "Spd", "Con"],
    manaCost() {
        return 10000;
    },
    loopCost(segment, loopCounter = towns[4].TidyLoopCounter) {
        return fibonacci(Math.floor((loopCounter + segment) - loopCounter / 3 + 0.0000001)) * 1000000; // Temp.
    },
    tickProgress(offset, _loopCounter, totalCompletions = towns[4].totalTidy) {
        return getSkillLevel("Practical") * Math.sqrt(1 + totalCompletions / 100);
    },
    loopsFinished(loopCounter = towns[4].TidyLoopCounter) {
        addResource("reputation", 1);
        addResource("gold", 5);
        setStoryFlag("tidiedUp");
    },
    segmentFinished() {
        // empty.
    },
    getPartName(loopCounter = towns[4].TidyLoopCounter) {
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${numberToWords(Math.floor((loopCounter + 0.0001) / this.segments + 1))}`;
    },
    visible() {
        return towns[4].getLevel("Canvassed") >= 10;
    },
    unlocked(){
        return towns[4].getLevel("Canvassed") >= 30;
    },
    finish(){
        setStoryFlag("tidiedUp");
    },
});

Action.BuyManaZ5 = new Action("Buy Mana Z5", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.manaZ5Bought;
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
        resetResource("gold");
        setStoryFlag("manaZ5Bought");
    },
});

Action.SellArtifact = new Action("Sell Artifact", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.artifactSold;
        }
    },
    stats: {
        Cha: 0.4,
        Per: 0.3,
        Luck: 0.2,
        Soul: 0.1
    },
    canStart() {
        return resources.artifacts >= 1;
    },
    cost() {
        addResource("artifacts", -1);
    },
    manaCost() {
        return 500;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 10;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 20;
    },
    finish() {
        setStoryFlag("artifactSold");
        addResource("gold", 50);
    },
});

Action.GiftArtifact = new Action("Gift Artifact", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.artifactDonated;
            case 2: return storyFlags.donated20Artifacts;
            case 3: return storyFlags.donated40Artifacts;
        }
    },
    stats: {
        Cha: 0.6,
        Luck: 0.3,
        Soul: 0.1
    },
    canStart() {
        return resources.artifacts >= 1;
    },
    cost() {
        addResource("artifacts", -1);
    },
    manaCost() {
        return 500;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 10;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 20;
    },
    finish() {
        setStoryFlag("artifactDonated");
        addResource("favors", 1);
        if (resources["favors"] >= 20) setStoryFlag("donated20Artifacts");
        if (resources["favors"] >= 50) setStoryFlag("donated40Artifacts");
    },
});

Action.Mercantilism = new Action("Mercantilism", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Mercantilism") >= 1;
            case 2: return getSkillLevel("Mercantilism") >= 30;
            case 3: return getSkillLevel("Mercantilism") >= 100;
            case 4: return getSkillLevel("Mercantilism") >= 500;
        }
    },
    stats: {
        Per: 0.2, // Temp
        Int: 0.7,
        Soul: 0.1
    },
    skills: {
        Mercantilism: 100
    },
    canStart() {
        return resources.reputation > 0;
    },
    manaCost() {
        return 10000; // Temp
    },
    cost() {
        addResource("reputation", -1);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 20;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 30;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");
    },
});

Action.CharmSchool = new Action("Charm School", {
    type: "normal",
    expMult: 4,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.charmSchoolVisited;
            case 2: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 100;
            case 3: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 1000;
            case 4: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 10000;
            case 5: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 100000;
        }
    },
    stats: {
        Cha: 0.8,
        Int: 0.2
    },
    allowed() {
        return trainingLimits;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 20;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 30;
    },
    finish() {
        setStoryFlag("charmSchoolVisited");
    },
});

Action.Oracle = new Action("Oracle", {
    type: "normal",
    expMult: 4,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.oracleVisited;
            case 2: return storyFlags.oracleVisited && getTalent("Luck") >= 100;
            case 3: return storyFlags.oracleVisited && getTalent("Luck") >= 1000;
            case 4: return storyFlags.oracleVisited && getTalent("Luck") >= 10000;
            case 5: return storyFlags.oracleVisited && getTalent("Luck") >= 100000;
        }
    },
    stats: {
        Luck: 0.8,
        Soul: 0.2
    },
    allowed() {
        return trainingLimits;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 30;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 40;
    },
    finish() {
        setStoryFlag("oracleVisited");
    },
});

Action.EnchantArmor = new Action("Enchant Armor", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.armorEnchanted;
            case 2: return storyFlags.enchanted10Armor;
            case 3: return storyFlags.enchanted20Armor;
        }
    },
    stats: {
        Cha: 0.6,
        Int: 0.2,
        Luck: 0.2
    },
    skills: {
        Crafting: 50
    },
    manaCost() {
        return 1000; // Temp
    },
    canStart() {
        return resources.favors >= 1 && resources.armor >= 1;
    },
    cost() {
        addResource("favors", -1);
        addResource("armor", -1);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 30;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 40;
    },
    finish() {
        handleSkillExp(this.skills);
        addResource("enchantments", 1);
        setStoryFlag("armorEnchanted");
        if (resources["enchantments"] >= 10) setStoryFlag("enchanted10Armor");
        if (resources["enchantments"] >= 25) setStoryFlag("enchanted20Armor");
    },
});

Action.WizardCollege = new MultipartAction("Wizard College", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "wizCollege",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyVars.maxWizardGuildSegmentCleared >= 0;
            case 12: return storyVars.maxWizardGuildSegmentCleared >= 3;
            case 2: return storyVars.maxWizardGuildSegmentCleared >= 6;
            case 3: return storyVars.maxWizardGuildSegmentCleared >= 12;
            case 4: return storyVars.maxWizardGuildSegmentCleared >= 18;
            case 6: return storyVars.maxWizardGuildSegmentCleared >= 30;
            case 8: return storyVars.maxWizardGuildSegmentCleared >= 42;
            case 10: return storyVars.maxWizardGuildSegmentCleared >= 54;
            case 13: return storyVars.maxWizardGuildSegmentCleared >= 57;
        }
    },
    stats: {
        Int: 0.5,
        Soul: 0.3,
        Cha: 0.2
    },
    loopStats: ["Int", "Cha", "Soul"],
    manaCost() {
        return 10000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return resources.gold >= 500 && resources.favors >= 10;
    },
    cost() {
        addResource("gold", -500);
        addResource("favors", -10);
    },
    loopCost(segment, loopCounter = towns[4][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e7; // Temp
    },
    tickProgress(offset, _loopCounter, totalCompletions = towns[4][`total${this.varName}`]) {
        return (
            getSkillLevel("Magic") + getSkillLevel("Practical") + getSkillLevel("Dark") +
            getSkillLevel("Chronomancy") + getSkillLevel("Pyromancy") + getSkillLevel("Restoration") + getSkillLevel("Spatiomancy")) *
            Math.sqrt(1 + totalCompletions / 1000);
    },
    loopsFinished() {
        // empty.
    },
    segmentFinished() {
        curWizCollegeSegment++;
        view.requestUpdate("adjustManaCost", "Restoration");
        view.requestUpdate("adjustManaCost", "Spatiomancy");
        increaseStoryVarTo("maxWizardGuildSegmentCleared", curWizCollegeSegment);
    },
    getPartName() {
        return `${getWizCollegeRank().name}`;
    },
    getSegmentName(segment) {
        return `${getWizCollegeRank(segment % 3).name}`;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        globalThis.IdleLoopsResourceState.setResourceValue(resources, "wizardCollege", true);
        increaseStoryVarTo("maxWizardGuildSegmentCleared", 0);
    },
});
function getWizCollegeRank(offset) {
    let name = [
        "Initiate",
        "Student",
        "Apprentice",
        "Disciple",
        "Spellcaster",
        "Magician",
        "Wizard",
        "Great Wizard",
        "Grand Wizard",
        "Archwizard",
        "Sage",
        "Great Sage",
        "Grand Sage",
        "Archsage",
        "Magus",
        "Great Magus",
        "Grand Magus",
        "Archmagus",
        "Member of The Council of the Seven",
    ][Math.floor(curWizCollegeSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curWizCollegeSegment % 3)) + curWizCollegeSegment;
    let bonus = precision3(1 + 0.02 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curWizCollegeSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Chair of The Council of the Seven";
        bonus = 5;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.Restoration = new Action("Restoration", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Restoration") >= 1;
            case 2: return getSkillLevel("Restoration") >= 50;
            case 3: return getSkillLevel("Restoration") >= 200;
            case 4: return getSkillLevel("Restoration") >= 500;
        }
    },
    stats: {
        Int: 0.5,
        Soul: 0.3,
        Con: 0.2
    },
    canStart() {
        return resources.wizardCollege;
    },
    affectedBy: ["Wizard College"],
    skills: {
        Restoration: 100
    },
    manaCost() {
        return 15000 / getWizCollegeRank().bonus;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.Spatiomancy = new Action("Spatiomancy", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Spatiomancy") >= 1;
            case 2: return getSkillLevel("Spatiomancy") >= 50;
            case 3: return getSkillLevel("Spatiomancy") >= 200;
            case 4: return getSkillLevel("Spatiomancy") >= 600;
            case 5: return getSkillLevel("Spatiomancy") >= 1000;
            case 6: return getSkillLevel("Spatiomancy") >= 1500;
        }
    },
    stats: {
        Int: 0.6,
        Con: 0.2,
        Per: 0.1,
        Spd: 0.1,
    },
    affectedBy: ["Wizard College"],
    skills: {
        Spatiomancy: 100
    },
    canStart() {
        return resources.wizardCollege;
    },
    manaCost() {
        return 20000 / getWizCollegeRank().bonus;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        const oldSpatioSkill = getSkillLevel("Spatiomancy");
        handleSkillExp(this.skills);
        if (getSkillLevel("Spatiomancy") !== oldSpatioSkill) {
            view.requestUpdate("adjustManaCost", "Mana Geyser");
            view.requestUpdate("adjustManaCost", "Mana Well");
            adjustAll();
            for (const action of totalActionList) {
                if (towns[action.townNum].varNames.indexOf(action.varName) !== -1) {
                    view.requestUpdate("updateRegular", {name: action.varName, index: action.townNum});
                }
            }
        }
    },
});

Action.SeekCitizenship = new Action("Seek Citizenship", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Citizen",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[4].getLevel(this.varName) >= 1;
            case 2: return towns[4].getLevel(this.varName) >= 20;
            case 3: return towns[4].getLevel(this.varName) >= 40;
            case 4: return towns[4].getLevel(this.varName) >= 60;
            case 5: return towns[4].getLevel(this.varName) >= 80;
            case 6: return towns[4].getLevel(this.varName) >= 100;
            //case 7: return storyReqs.repeatedCitizenExam;
        }
    },
    stats: {
        Cha: 0.5,
        Int: 0.2,
        Luck: 0.2,
        Per: 0.1
    },
    manaCost() {
        return 1500; // Temp
    },
    visible() {
        return towns[4].getLevel("Tour") >= 60;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 80;
    },
    finish() {
        towns[4].finishProgress(this.varName, 100);
        //Todo: Figure out a way to check if this is the first time the Seek Citizenship
        //action was performed in a loop *after* the loop in which 100% was achieved,
        //and unlock the repeatedCitizenExam story.
    },
});

Action.BuildHousing = new Action("Build Housing", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.houseBuilt;
            case 2: return storyFlags.housesBuiltGodlike;
            case 3: return storyFlags.built50Houses;
        }
    },
    stats: {
        Str: 0.4,
        Con: 0.3,
        Dex: 0.2,
        Spd: 0.1
    },
    skills: {
        Crafting: 100
    },
    affectedBy: ["Crafting Guild"],
    canStart() {
        //Maximum crafting guild bonus is 10, maximum spatiomancy mult is 5.
        let maxHouses = Math.floor(getCraftGuildRank().bonus * getSkillMod("Spatiomancy",0,500,1));
        return guild === "Crafting" && towns[4].getLevel("Citizen") >= 100 && resources.houses < maxHouses;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        addResource("houses", 1);
        handleSkillExp(this.skills);
        setStoryFlag("houseBuilt");
        if (resources.houses >= 10 && getCraftGuildRank().name == "Godlike")
            setStoryFlag("housesBuiltGodlike");
        if (resources.houses >= 50)
            setStoryFlag("built50Houses");
    },
});

Action.CollectTaxes = new Action("Collect Taxes", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.collectedTaxes;
            case 2: return storyFlags.collected50Taxes;
        }
    },
    stats: {
        Cha: 0.4,
        Spd: 0.2,
        Per: 0.2,
        Luck: 0.2
    },
    affectedBy: ["Build Housing"],
    canStart() {
        return resources.houses > 0;
    },
    allowed () {
        return 1;
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 60;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100 && getSkillLevel("Mercantilism") > 0;
    },
    finish() {
        const goldGain = Math.floor(resources.houses * getSkillLevel("Mercantilism") / 10);
        addResource("gold", goldGain);
        setStoryFlag("collectedTaxes");
        if (resources.houses >= 50)
            setStoryFlag("collected50Taxes");

        //Is this necessary? The return value for finish() seems unused.
        return goldGain;
    },
});

Action.Pegasus = new Action("Pegasus", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.acquiredPegasus;
            case 2: return storyFlags.acquiredPegasusWithTeam;
        }
    },
    stats: {
        Soul: 0.3,
        Cha: 0.2,
        Luck: 0.2,
        Int: 0.3
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 3000;
    },
    canStart() {
        return resources.gold >= 200 && resources.favors >= 20;
    },
    cost() {
        addResource("favors", -20);
        addResource("gold", -200);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 70;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 90;
    },
    finish() {
        addResource("pegasus", true);
        setStoryFlag("acquiredPegasus");
        if (resources.teamMembers >= 5)
            setStoryFlag("acquiredPegasusWithTeam");
    },
});

Action.FightFrostGiants = new MultipartAction("Fight Frost Giants", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "FightFrostGiants",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.giantGuildTestTaken;
            case 2: return storyFlags.giantGuildRankEReached;
            case 3: return storyFlags.giantGuildRankDReached;
            case 4: return storyFlags.giantGuildRankCReached;
            case 5: return storyFlags.giantGuildRankBReached;
            case 6: return storyFlags.giantGuildRankAReached;
            case 7: return storyFlags.giantGuildRankSReached;
            case 8: return storyFlags.giantGuildRankSSReached;
            case 9: return storyFlags.giantGuildRankSSSReached;
            case 10: return storyFlags.giantGuildRankUReached;
            case 11: return storyFlags.giantGuildRankGodlikeReached;
        }
    },
    stats: {
        Str: 0.5,
        Con: 0.3,
        Per: 0.2,
    },
    skills: {
        Combat: 1500
    },
    loopStats: ["Per", "Con", "Str"],
    manaCost() {
        return 20000;
    },
    allowed() {
        return 1;
    },
    affectedBy: ["Pegasus"],
    canStart() {
        return resources.pegasus;
    },
    loopCost(segment, loopCounter = towns[4][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e7; // Temp
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[4][`total${this.varName}`]) {
        return (getSelfCombat() *
            Math.sqrt(1 + totalCompletions / 1000));
    },
    loopsFinished() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curFightFrostGiantsSegment++;
        if (curFightFrostGiantsSegment >= 3) setStoryFlag("giantGuildRankEReached");
        if (curFightFrostGiantsSegment >= 9) setStoryFlag("giantGuildRankDReached");
        if (curFightFrostGiantsSegment >= 15) setStoryFlag("giantGuildRankCReached");
        if (curFightFrostGiantsSegment >= 21) setStoryFlag("giantGuildRankBReached");
        if (curFightFrostGiantsSegment >= 27) setStoryFlag("giantGuildRankAReached");
        if (curFightFrostGiantsSegment >= 33) setStoryFlag("giantGuildRankSReached");
        if (curFightFrostGiantsSegment >= 39) setStoryFlag("giantGuildRankSSReached");
        if (curFightFrostGiantsSegment >= 45) setStoryFlag("giantGuildRankSSSReached");
        if (curFightFrostGiantsSegment >= 51) setStoryFlag("giantGuildRankUReached");
        if (curFightFrostGiantsSegment >= 57) setStoryFlag("giantGuildRankGodlikeReached");
    },
    getPartName() {
        return `${getFrostGiantsRank().name}`;
    },
    getSegmentName(segment) {
        return `${getFrostGiantsRank(segment % 3).name}`;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        setStoryFlag("giantGuildTestTaken");
    },
});
function getFrostGiantsRank(offset) {
    let name = [
        "Private",
        "Corporal",             //E
        "Specialist",
        "Sergeant",             //D
        "Staff Sergeant",
        "Sergeant First Class", //C
        "Master Sergeant",
        "Sergeant Major",       //B
        "Warrant Officer",
        "Chief Warrant Officer",//A
        "Second Lieutenant",
        "First Lieutenant",     //S
        "Major",
        "Lieutenant Colonel",   //SS
        "Colonel",
        "Lieutenant Commander", //SSS
        "Commander",
        "Captain",              //U
        "Rear Admiral",
        "Vice Admiral"          //godlike
    ][Math.floor(curFightFrostGiantsSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curFightFrostGiantsSegment % 3)) + curFightFrostGiantsSegment;
    let bonus = precision3(1 + 0.05 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curFightFrostGiantsSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Admiral";
        bonus = 10;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.SeekBlessing = new Action("Seek Blessing", {
    type: "normal",
    expMult: 5,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.blessingSought;
            case 2: return getSkillLevel("Divine") >= 1;
            case 3: return storyFlags.greatBlessingSought;
        }
    },
    stats: {
        Cha: 0.5,
        Luck: 0.5
    },
    skills: {
        Divine: 50
    },
    canStart() {
        return resources.pegasus;
    },
    allowed() {
        return 1;
    },
    affectedBy: ["Pegasus"],
    manaCost() {
        return 1000000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        setStoryFlag("blessingSought");
        if (getFrostGiantsRank().bonus >= 10) setStoryFlag("greatBlessingSought");
        // @ts-ignore
        this.skills.Divine = Math.floor(50 * getFrostGiantsRank().bonus);
        handleSkillExp(this.skills);
    },
});

Action.GreatFeast = new MultipartAction("Great Feast", {
    type: "multipart",
    expMult: 5,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.feastAttempted;
            case 2: return getBuffLevel("Feast") >= 1;
        }
    },
    stats: {
        Spd: 0.1,
        Int: 0.1,
        Soul: 0.8
    },
    loopStats: ["Spd", "Int", "Soul"],
    manaCost() {
        return 5000000;
    },
    allowed() {
        return 1;
    },
    canStart(loopCounter = towns[this.townNum].GreatFeastLoopCounter) {
        return resources.reputation >= 100 && loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Feast") < getBuffCap("Feast");
    },
    loopCost(segment) {
        return 1000000000 * (segment * 5 + 1);
    },
    tickProgress(offset) {
        return getSkillLevel("Practical");
    },
    grantsBuff: "Feast",
    loopsFinished() {
        const spent = sacrificeSoulstones(this.goldCost());
        addBuffAmt("Feast", 1, this, "soulstone", spent);
        view.requestUpdate("updateSoulstones", null);
        view.requestUpdate("adjustGoldCost", {varName: "GreatFeast", cost: this.goldCost()});
    },
    getPartName() {
        return "Host Great Feast";
    },
    visible() {
        return towns[4].getLevel("Tour") >= 80;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 100;
    },
    goldCost() {
        return Math.ceil(5000 * (getBuffLevel("Feast") + 1) * getSkillBonus("Gluttony"));
    },
    finish() {
        setStoryFlag("feastAttempted")
        view.requestUpdate("updateBuff", "Feast");
    },
});

Action.FallFromGrace = new Action("Fall From Grace", {
    type: "normal",
    expMult: 2,
    townNum: 4,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return storyFlags.fellFromGrace;
        }
        return false;
    },
    stats: {
        Dex: 0.4,
        Luck: 0.3,
        Spd: 0.2,
        Int: 0.1,
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return getSkillLevel("Pyromancy") >= 200;
    },
    finish() {
        if (resources.reputation >= 0) {
            globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", -1);
        }
        view.requestUpdate("updateResource", 'reputation');
        setStoryFlag("fellFromGrace");
        unlockTown(5);
    },
});

        cachedDefinitions = Object.freeze({
            getWizCollegeRank,
            getFrostGiantsRank,
        });

        global.getWizCollegeRank = getWizCollegeRank;
        global.getFrostGiantsRank = getFrostGiantsRank;
        return cachedDefinitions;
    };

    global.IdleLoopsZoneDefinitionFactories = Object.freeze({
        ...existingFactories,
        registerValhallaActions,
    });
})(globalThis);
