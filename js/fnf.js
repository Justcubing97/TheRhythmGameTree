addLayer("fnf", {
    name: "fnf", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🎤", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"), //defaults for normal layers
    }},
    color: "#e34998",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( #fff, #e34998)";
		return style;
	},
    requires: new Decimal("1e1000"), // Can be a function that takes requirement increases into account
    resource: "Funk Points", // Name of prestige currency
    baseResource: "Cubes", // Name of resource prestige is based on
    baseAmount() {return player.bs.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.025, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        mult = mult.mul(player.ddrm.hEffect)
        
        layer = "d"
        if (hasUpgrade(layer, 91)) mult = mult.mul(3)
        if (hasUpgrade(layer, 92)) mult = mult.mul(5)
        if (hasUpgrade(layer, 93)) mult = mult.mul(7)
        if (hasUpgrade(layer, 94)) mult = mult.mul(9)

        layer = "bs"
        mult = mult.mul(buyableEffect(layer, 122))

        layer = "fnf"
        if (hasUpgrade(layer, 14)) mult = mult.mul(upgradeEffect(layer, 14))
        if (hasMilestone(layer, 12)) mult = mult.mul(player.ddrfc.points)
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //primary multi
    getResetGain() {
        let layer = "fnf"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (gain.gte(player[layer].softcap1Start)) gain = gain.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
        //put after first softcap things after this line
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [ //use shift for currencies, regulars for minigames
        {key: "R", description: "SHIFT+R: Reset for Funk Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("bs", 74)) player.fnf.unlocked = true
        return player.fnf.unlocked
    },
    passiveGeneration() {return false}, //use autoPrestige() if static!
    canReset(){return hasUpgrade("bs", 74) && getResetGain(this.layer).gte(1)},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        let keptChallenges = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.bs.points)} Cubes.`}],
                ["blank", function() {if (!hasUpgrade("bs", 74)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasUpgrade("bs", 74)) return "You need \"Ascend to a Lower Reality\" first!"}],
                ["blank", "17px"],
                ["display-text", function(){return "<i>Note: I cannot find many mechanics from researching FNF. This is why Funk Points is the currency. Additionally, the DDR minigame will also be in lieu of the FNF minigame, since they are basically identical. There will be more mechanics in this minigame when you unlock them.</i>"}],
                "blank",
                "upgrades",
                ["blank", function() {if (hasMilestone("fnf", 6)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                "milestones",
            ],
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 1 Funk Point",
            effectDescription: "Quality of life day 1. Keep the first 16 Song milestones and first 16 DDR upgrades. Keep ALL Note upgrades up to this point. x1e10 Songs, Cubes, Distance, Movement, and TVC.",
            done() { return player.fnf.points.gte(1) },
        },
        2: {
            requirementDescription: "2: 2 Funk Points",
            effectDescription: "Quality of life day 2. Passively generate Notes, Arrows, FCTs, Marvelous, Great, Almost arrows, DDR Combo, BS Combo, Cuts, Bad Cuts, and passively compose Songs. You can gain Movement outside of the VR Headset. Bulk-buy the first two Distance buyables. Missing in the Beat Saber Minigame does not reset combo.",
            done() { return player.fnf.points.gte(2) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        3: {
            requirementDescription: "3: 3 Funk Points",
            effectDescription: "Quality of life day 3. Click one tile in the Distance layer every few ticks. Passively generate Distance. Heavily improve Movement's, highest mission level's, and TVC's effects. Keep the first 16 Song upgrades.",
            done() { return player.fnf.points.gte(3) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        4: {
            requirementDescription: "4: 5 Funk Points",
            effectDescription: "Quality of life day 4. Keep the Distance and TVC buyables. Keep the four unlocked Contaminations. Keep the Beat Saber recovery upgrades. x1e50 Songs.",
            done() { return player.fnf.points.gte(5) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        5: {
            requirementDescription: "5: 10 Funk Points",
            effectDescription: "Quality of life day 5. The one you've been waiting for. Passively generate Cubes. Unlock more Movement upgrades. Unlock Health in the DDR minigame, but lose the ability to hit arrows in the minigame automatically. GP's effect to Distance is improved.",
            done() { return player.fnf.points.gte(10) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        6: {
            requirementDescription: "6: 75 Funk Points",
            effectDescription: "Quality of life day 6. Keep Campaign buyables up to level 11. Highest mission level's effect multiplies BS Combo, Cuts, Bad Cuts, and Movement. Unlock two rows of FNF upgrades.",
            done() { return player.fnf.points.gte(75) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        7: {
            requirementDescription: "7: 5,000,000 Funk Points",
            effectDescription: "Quality of life day 7. Keep BS EASY, NORMAL, and HARD. Keep all Distance upgrades up to \"Picometer 4\". Keep all Beat Saber upgrades up to this point. +10% to max FNF health. Contamination Factors are weaker.",
            done() { return player.fnf.points.gte("5e6") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        8: {
            requirementDescription: "8: 1.75e9 Funk Points",
            effectDescription: "Progression day 1. Keep Convoluted Contaminations 1-4 on FNF reset. Greatly improve Almost arrows' effect and it now multiplies TVC.",
            done() { return player.fnf.points.gte("1.75e9") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        9: {
            requirementDescription: "9: 1e12 Funk Points",
            effectDescription: "Progression day 2. Reduce the cost of Full Combo Tiers. They boost Funk Points. Stamina and max Stamina will always be equal.",
            done() { return player.fnf.points.gte("1e12") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        10: {
            requirementDescription: "10: 1e16 Funk Points",
            effectDescription: "Progression day 3. Extend the Beat Saber campaign. <i>The new levels will not be reset.</i>",
            done() { return player.fnf.points.gte("1e16") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        11: {
            requirementDescription: "11: 1e25 Funk Points",
            effectDescription: "Progression day 4. An extraordinary +50% max player health! All arrow hits give an additional +15%. Improve the TVC effect.",
            done() { return player.fnf.points.gte("1e25") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        12: {
            requirementDescription: "12: 1e30 Funk Points",
            effectDescription: "Progression day 5. Delay the Cubes and TVC softcap by x1e100. Unlock \"EXPERT\" and \"EXPERT+\" Beat Saber difficulties. <i>These difficulty completions will be kept on FNF reset.</i>",
            done() { return player.fnf.points.gte("1e30") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        13: {
            requirementDescription: "13: 1e48 Funk Points",
            effectDescription: "Progression day 6. ^1.05 Arrows after second softcap. Improve BS Combo's effect and x1e1000 Cuts.",
            done() { return player.fnf.points.gte("1e48") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        14: {
            requirementDescription: "14: 1e56 Funk Points",
            effectDescription: "Progression day 7. Unlock Girlfriend Level. [NOT IMPLEMENTED] Toxic Violet Cubes have a greater effect on its effect. Improve player health effect and \"NOT Infinity\".",
            done() { return player.fnf.points.gte("1e56") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
    },
    upgrades: {
        11: {
            title: "Daddy Dearest",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(0.5)

                if (hasUpgrade("fnf", 24)) base = base.mul(upgradeEffect("fnf", 24))

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e100")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to HN and EN"
                return text
            },
            description: "Funk Points boost HN and EN after softcaps.",
            cost: new Decimal("200000"),
            unlocked() {return hasMilestone("fnf", 6)},
        },
        12: {
            title: "Bopeebo",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(0.01).log(10).add(1)

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1.5")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "^" + format(upgradeEffect(this.layer, this.id), 6) + " to Cubes"
                return text
            },
            description: "Funk Points raise Cubes after softcap.",
            cost: new Decimal("300000"),
            unlocked() {return hasUpgrade("fnf", 11)},
        },
        13: {
            title: "Fresh",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(5)

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e1000")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to TVC's softcap start"
                return text
            },
            description: "Funk Points delay the TVC softcap.",
            cost: new Decimal("1e7"),
            unlocked() {return hasUpgrade("fnf", 11)},
        },
        14: {
            title: "DadBattle",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(0.02)

                let softcap = new Decimal(0.1) 
                let softcapStart = new Decimal("1e10")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to itself"
                return text
            },
            description: "Funk Points boost themselves.",
            cost: new Decimal("1e8"),
            unlocked() {return hasUpgrade("fnf", 11)},
        },
        
        21: {
            title: "Spooky Month",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(0.75)
                
                if (hasUpgrade("fnf", 24)) base = base.mul(upgradeEffect("fnf", 24))

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e500")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to Distance and Movement"
                return text
            },
            description: "Funk Points boost Distance and Movement.",
            cost: new Decimal("150e6"),
            unlocked() {return hasMilestone("fnf", 6)},
        },
        22: {
            title: "Spookeez",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.pow(3)

                let softcap = new Decimal(0.1) 
                let softcapStart = new Decimal("1e250")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to BS Combo and effect"
                return text
            },
            description: "Funk Points boost BS Combo and its effect.",
            cost: new Decimal("5e8"),
            unlocked() {return hasUpgrade("fnf", 21)},
        },
        23: {
            title: "South",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = new Decimal(1).div(base.pow(0.0015))

                return base
            },
            effectDisplay() {
                let text = "^" + format(upgradeEffect(this.layer, this.id), 6) + " to CFs"
                return text
            },
            description: "Funk Points weaken all Contamination Factors.",
            cost: new Decimal("1e9"),
            unlocked() {return hasUpgrade("fnf", 21)},
        },
        24: {
            title: "Monster",
            effect() {
                if (inChallenge("bs", 31)) return new Decimal(1)
                let base = player.fnf.points.add(1)
                base = base.log(2).add(1)

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to effects and Movement."
                return text
            },
            description: "Funk Points boost \"Daddy Dearest\", \"Spooky Month\", and Movement.",
            cost: new Decimal("1e10"),
            unlocked() {return hasUpgrade("fnf", 21)},
        },
    },
    tooltip() {
        text = format(player.fnf.points) + " Funk Points (+" + format(getResetGain("fnf")) + " Funk Points on reset)"
        if (!canReset(this.layer)) text = format(player.fnf.points) + " Funk Points (\"Ascend to a Lower Reality\" needed to reset)"
        return text
    },
})