addLayer("fnf", {
    name: "fnf", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🎤", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        xp: new Decimal(0),
        xpGain: new Decimal(0),
        level: new Decimal(0),
        nextCost: new Decimal(10),
        prevCost: new Decimal(0),

        levelEffect1: new Decimal(1),
        levelEffect2: new Decimal(1),
        levelEffect3: new Decimal(1),

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

        if (player.ddrfc.points.gte(32)) mult = mult.mul(1000)
        
        layer = "d"
        if (hasUpgrade(layer, 91)) mult = mult.mul(3)
        if (hasUpgrade(layer, 92)) mult = mult.mul(5)
        if (hasUpgrade(layer, 93)) mult = mult.mul(7)
        if (hasUpgrade(layer, 94)) mult = mult.mul(9)
            
        if (hasUpgrade(layer, 121)) mult = mult.mul(100)
        if (hasUpgrade(layer, 122)) mult = mult.mul(150)
        if (hasUpgrade(layer, 123)) mult = mult.mul(200)
        if (hasUpgrade(layer, 124)) mult = mult.mul(250)

        layer = "bs"
        mult = mult.mul(buyableEffect(layer, 122))
        mult = mult.mul(new Decimal(1000).pow(challengeCompletions(layer, 31)))

        layer = "fnf"
        if (hasUpgrade(layer, 14)) mult = mult.mul(upgradeEffect(layer, 14))
        if (hasMilestone(layer, 12)) mult = mult.mul(player.ddrfc.points.add(1))
            
        mult = mult.mul(buyableEffect(layer, 12))
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
        "Girlfriend Level": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.bs.points)} Cubes.`}],
                ["blank", function() {if (!hasUpgrade("bs", 74)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasUpgrade("bs", 74)) return "You need \"Ascend to a Lower Reality\" first!"}],
                ["blank", "17px"],
                ["display-text", function(){return `Your girlfriend is at level <h2 style="color: #e34998; text-shadow: 0px 0px 10px #e34998">${format(player.fnf.level)}</h2>`}],
                ["bar", "gfLevel"],
                ["display-text", function(){return `You are gaining +${format(player.fnf.xpGain)} GFXP per second.`}],
                ["display-text", function(){return `<i>This bar is logarithmic.</i>`}],
                "blank",
                ["display-text", function(){return `Girlfriend Level boosts Distance and TVC by x${format(player.fnf.levelEffect1)}`}],
                ["display-text", function(){return `Girlfriend Level boosts BS Combo and Cubes by x${format(player.fnf.levelEffect2)}`}],
                ["display-text", function(){if (hasMilestone("tvc", 15)) return `Girlfriend Level boosts Cuts and Bad Cuts by x${format(player.fnf.levelEffect3)}`}],
                "blank",
                ["buyables", [1]],
            ],
            unlocked() {return hasMilestone("fnf", 14)},
        },
        "Difficulties": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.bs.points)} Cubes.`}],
                ["blank", function() {if (!hasUpgrade("bs", 74)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasUpgrade("bs", 74)) return "You need \"Ascend to a Lower Reality\" first!"}],
                ["blank", "17px"],
                "challenges",
            ],
            unlocked() {return hasMilestone("fnf", 14)},
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
            effectDescription: "Progression day 7. Unlock Girlfriend Level. Toxic Violet Cubes have a greater effect on its effect. Improve player health effect and \"NOT Infinity\". Unlock the third week of FNF upgrades.",
            done() { return player.fnf.points.gte("1e56") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        15: {
            requirementDescription: "15: 1e93 Funk Points",
            effectDescription: "Expansion day 1. Unlock Saber Sacrifice (see Beat Saber Minigame).",
            done() { return player.fnf.points.gte("1e93") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        16: {
            requirementDescription: "16: 1e120 Funk Points",
            effectDescription: "Expansion day 2. Keep the Distance upgrades up to Megameter 4, and unlock a fourth Distance buyable.",
            done() { return player.fnf.points.gte("1e120") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        17: {
            requirementDescription: "17: 1e180 Funk Points",
            effectDescription: "Expansion day 3. Unlock FNF difficulties Easy, Normal, and Hard.",
            done() { return player.fnf.points.gte("1e180") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        18: {
            requirementDescription: "18: 1e193 Funk Points",
            effectDescription: "Expansion day 4. Unlock a third Girlfriend Level buyable.",
            done() { return player.fnf.points.gte("1e193") },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        19: {
            requirementDescription: "19: 1e196 Funk Points",
            effectDescription: "Expansion day 5. Unlock two rows of Beat Saber upgrades.",
            done() { return player.fnf.points.gte("1e196") },
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

                let softcap1 = new Decimal(0.25) 
                let softcap1Start = new Decimal("1.5")

                if (base.gte(softcap1Start)) base = base.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap1))) //softcap

                let softcap2 = new Decimal(0.1) 
                let softcap2Start = new Decimal("1.7")

                if (base.gte(softcap2Start)) base = base.pow(softcap2).mul(new Decimal(softcap2Start).pow(decimalOne.sub(softcap2))) //softcap
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
                
                if (hasUpgrade("fnf", 34)) base = base.mul(upgradeEffect("fnf", 34))

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
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to BS Combo (after exponents) and effect"
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
                
                if (hasUpgrade("fnf", 34)) base = base.mul(upgradeEffect("fnf", 34))

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
        31: {
            title: "Pico (Week)",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.log(15).pow(0.5).add(1)

                if (hasChallenge("fnf", 21)) base = base.pow(2.5)

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to GFXP"
                return text
            },
            description: "Funk Points boost GFXP gain.",
            cost: new Decimal("1e63"),
            unlocked() {return hasMilestone("fnf", 14)},
        },
        32: {
            title: "Pico (Song)",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(0.25)

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to Songs"
                return text
            },
            description: "Funk Points boost Songs gain.",
            cost: new Decimal("1e68"),
            unlocked() {return hasUpgrade("fnf", 31)},
        },
        33: {
            title: "Philly Nice",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(15)

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e2500")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to DDR combo softcap start"
                return text
            },
            description: "Funk Points delay the DDR combo softcap start.",
            cost: new Decimal("1e73"),
            unlocked() {return hasUpgrade("fnf", 31)},
        },
        34: {
            title: "Blammed",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(0.05)

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e10")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to effects"
                return text
            },
            description: "Funk Points boost \"Monster\" and \"DadBattle\".",
            cost: new Decimal("1e80"),
            unlocked() {return hasUpgrade("fnf", 31)},
        },

        41: {
            title: "Mommy Must Murder",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(0.03).div(10000).add(1)

                return Decimal.min(base, new Decimal(30))
            },
            effectDisplay() {
                let text = "^" + format(upgradeEffect(this.layer, this.id)) + " to effects"
                return text
            },
            description: "Funk Points boost first two Girlfriend Level effects.",
            cost: new Decimal("1e110"),
            unlocked() {return hasMilestone("tvc", 15)},
        },
        42: {
            title: "Satin Panties",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(0.01).div(25).add(1)

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1.25")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "^" + format(upgradeEffect(this.layer, this.id), 6) + " to arrows"
                return text
            },
            description: "Funk Points boost Marvelous, Great, and Almost arrows after second softcap.",
            cost: new Decimal("1e125"),
            unlocked() {return hasMilestone("tvc", 15)},
        },
        43: {
            title: "High",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(1.25)

                if (hasChallenge("fnf", 21)) base = base.pow(player.fnf.points.add(1).pow(0.01))

                let softcap = new Decimal(0.25) 
                let softcapStart = new Decimal("1e250")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " to Cuts"
                return text
            },
            description: "Funk Points boost Cuts.",
            cost: new Decimal("1e137"),
            unlocked() {return hasMilestone("tvc", 15)},
        },
        44: {
            title: "M.I.L.F",
            effect() {
                let base = player.fnf.points.add(1)
                base = base.pow(0.01).log("1e10").add(1)

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id), 6) + " to cost"
                return text
            },
            description: "Funk Points multiply Full Combo Tiers.",
            cost: new Decimal("1e190"),
            unlocked() {return hasMilestone("tvc", 15)},
        },
    },

    bars: {
        gfLevel: {
            direction: RIGHT,
            width: 727,
            height: 50,
            display() {
                let text = `You have <h2 style="color: #e34998; text-shadow: 0px 0px 10px #e34998">${format(player.fnf.xp)}/${format(player.fnf.nextCost)}</h2> GFXP for the next level.`
                return text
            },
            progress() {
                let prog = new Decimal(0)
                prog = player.fnf.xp.div(player.fnf.prevCost).add(1).log(10).div(player.fnf.nextCost.div(player.fnf.prevCost).add(1).log(10))
                
                return prog
            },
            fillStyle() { return {"background-color": "rgb(126, 23, 88)",} },
        },
    },

    buyables: {
        11: {
            base() {return new Decimal("10")},
            exponentialBase() {
                let init = new Decimal("15")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Bond Strengthening",
            display() {
                return "Multiplies GFXP gain by x" + format(tmp[this.layer].buyables[this.id].effectBase) + " per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player.fnf.xp.gte(this.cost()) },
            buy() {
                if (false){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    setBuyableAmount(this.layer, this.id, Decimal.min(getBuyableAmount(this.layer, this.id).add(amount), tmp[this.layer].buyables[this.id].purchaseLimit))
                } else {
                    player.fnf.xp = player.fnf.xp.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effectBase() {
                let base = player.fnf.xp.add(1).log(100).pow(0.5).add(1)
                return base
            },
            effect(x) {
                let base = tmp[this.layer].buyables[this.id].effectBase
                base = base.add(buyableEffect("bs", 141))
                let effect = base.pow(x)

                let softcap1 = new Decimal(0.5)
                let softcap1Start = new Decimal("5e3")
                if (hasChallenge("fnf", 21)) softcap1Start = new Decimal("1e25")

                if (effect.gte(softcap1Start)) effect = effect.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap1))) //softcap

                let softcap2 = new Decimal(0.25)
                let softcap2Start = new Decimal("1e21")
                if (hasChallenge("fnf", 21)) softcap2Start = new Decimal("1e50")

                if (effect.gte(softcap2Start)) effect = effect.pow(softcap2).mul(new Decimal(softcap2Start).pow(decimalOne.sub(softcap2))) //softcap

                return effect
            },
            unlocked() {return true},
            buyMax() {
                let timesBought = player.fnf.xp
                //insert cost effects here

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //insert cost effects here

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        12: {
            base() {return new Decimal("1e15")},
            exponentialBase() {
                let init = new Decimal("6250")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Dance Together",
            display() {
                return "Multiplies FP gain by x" + format(tmp[this.layer].buyables[this.id].effectBase) + " per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player.fnf.xp.gte(this.cost()) },
            buy() {
                if (false){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    setBuyableAmount(this.layer, this.id, Decimal.min(getBuyableAmount(this.layer, this.id).add(amount), tmp[this.layer].buyables[this.id].purchaseLimit))
                } else {
                    player.fnf.xp = player.fnf.xp.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effectBase() {
                let base = player.fnf.xp.add(1).log(2).pow(0.75).add(1)
                return base
            },
            effect(x) {
                let base = tmp[this.layer].buyables[this.id].effectBase
                let effect = base.pow(x)

                let softcap1 = new Decimal(0.5)
                let softcap1Start = new Decimal("1e5")
                if (hasChallenge("fnf", 21)) softcap1Start = new Decimal("1e15")

                if (effect.gte(softcap1Start)) effect = effect.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap1))) //softcap

                let softcap2 = new Decimal(0.25)
                let softcap2Start = new Decimal("1e8")
                if (hasChallenge("fnf", 21)) softcap2Start = new Decimal("1e30")

                if (effect.gte(softcap2Start)) effect = effect.pow(softcap2).mul(new Decimal(softcap2Start).pow(decimalOne.sub(softcap2))) //softcap

                return effect
            },
            unlocked() {return true},
            buyMax() {
                let timesBought = player.fnf.xp
                //insert cost effects here

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //insert cost effects here

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        13: {
            base() {return new Decimal("1e88")},
            exponentialBase() {
                let init = new Decimal("1e6")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Cherry Soda",
            display() {
                return "Multiplies GFXP gain by x" + format(tmp[this.layer].buyables[this.id].effectBase) + " per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player.fnf.xp.gte(this.cost()) },
            buy() {
                if (false){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    setBuyableAmount(this.layer, this.id, Decimal.min(getBuyableAmount(this.layer, this.id).add(amount), tmp[this.layer].buyables[this.id].purchaseLimit))
                } else {
                    player.fnf.xp = player.fnf.xp.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effectBase() {
                let base = player.fnf.level
                base = base.pow(1.5)
                return base
            },
            effect(x) {
                let base = tmp[this.layer].buyables[this.id].effectBase
                let effect = base.pow(x)

                let softcap1 = new Decimal(0.333)
                let softcap1Start = new Decimal("1e20")

                if (effect.gte(softcap1Start)) effect = effect.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap1))) //softcap

                return effect
            },
            unlocked() {return hasMilestone("fnf", 18)},
            buyMax() {
                let timesBought = player.fnf.xp
                //insert cost effects here

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //insert cost effects here

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
    },

    challenges: {
        11: {
            name: "Easy",
            challengeDescription: "The easiest and simplest. Funk Points are reset. No catches!",
            goalDescription: "Have 1e2140 Cubes.",
            rewardDescription: "Automatically bulk buy the first five TVC buyables, unlock a sixth, and delay its softcap by x1e250.",
            canComplete: function() {return player.bs.points.gte("1e2140")},
            unlocked() {return hasMilestone("fnf", 17)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#00FF00",
                }
            },
            onEnter() {player.fnf.points = new Decimal(0)},
            onExit() {player.fnf.points = new Decimal(0)},
        },
        12: {
            name: "Normal",
            challengeDescription: "The challenge recommended for most players. Funk Points are reset. But you can't gain Cuts, Bad Cuts, nor BS combo.",
            goalDescription: "Have 1e1600 Cubes.",
            rewardDescription: "Improve the Saber Sacrifice exponent, and it now delays the TVC softcap start and boosts Movement.",
            canComplete: function() {return player.bs.points.gte("1e1600")},
            unlocked() {return hasMilestone("fnf", 17)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#FFFF00",
                }
            },
            onEnter() {player.fnf.points = new Decimal(0)},
            onExit() {player.fnf.points = new Decimal(0)},
        },
        21: {
            name: "Hard",
            challengeDescription: "One note, one beat. Funk Points are reset. The first four ME softcaps are ^0.001.",
            goalDescription: "Have 1e2240 Cubes.",
            rewardDescription: "Improve \"Pico (Week)\" and \"High\". Delay the softcaps of \"Bond Strengthening\" and \"Dance Together\". Keep Distance Gigameter upgrades.",
            canComplete: function() {return player.bs.points.gte("1e2240")},
            unlocked() {return hasMilestone("fnf", 17)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#FF0000",
                }
            },
            onEnter() {player.fnf.points = new Decimal(0)},
            onExit() {player.fnf.points = new Decimal(0)},
        },
    },

    update(diff) {
        let mult = new Decimal(1)
        if (hasMilestone("fnf", 14)) {
            //calculate gain
            mult = new Decimal(1)

            if (player.ddrfc.points.gte(32)) mult = mult.mul(1000)

            mult = mult.mul(buyableEffect("fnf", 11))
            mult = mult.mul(buyableEffect("fnf", 13))
            mult = mult.mul(buyableEffect("bs", 132))
            if (hasUpgrade("fnf", 31)) mult = mult.mul(upgradeEffect("fnf", 31))
                
            if (hasUpgrade("d", 121)) mult = mult.mul(25)
            if (hasUpgrade("d", 122)) mult = mult.mul(50)
            if (hasUpgrade("d", 123)) mult = mult.mul(75)
            if (hasUpgrade("d", 124)) mult = mult.mul(100)
                
            if (hasUpgrade("d", 141)) mult = mult.mul(upgradeEffect("d", 141))
            if (hasUpgrade("d", 142)) mult = mult.mul(upgradeEffect("d", 142))
            if (hasUpgrade("d", 143)) mult = mult.mul(upgradeEffect("d", 143))

            if (hasMilestone("s", 17)) mult = mult.mul("1e8")
                
            if (hasMilestone("tvc", 17)) mult = mult.mul(player.tvc.points.add(1).log(1.01).add(1).pow(2))
                
            //exp
            mult = mult.pow(player.bsm.sacExp)

            //ffff
            player.fnf.xpGain = mult
            player.fnf.xp = player.fnf.xp.add(player.fnf.xpGain.times(diff))

            //perform level up
            if (player.fnf.xp.gte(player.fnf.nextCost)) player.fnf.level = player.fnf.level.add(1)

            //calculate threshold
            mult = new Decimal(10)
            mult = mult.pow(player.fnf.level.add(1))
            mult = mult.pow(player.fnf.level.add(1).pow(0.25))

            if (player.fnf.level.gte(10) && !hasUpgrade("bs", 82)) mult = mult.mul(mult.pow(0.15))
            if (player.fnf.level.gte(20)) mult = mult.mul(mult.pow(0.20))
            if (player.fnf.level.gte(30)) mult = mult.mul(mult.pow(0.225))
            if (player.fnf.level.gte(40)) mult = mult.mul(mult.pow(0.2375))
            
            player.fnf.nextCost = mult
            
            mult = new Decimal(10)
            mult = mult.pow(player.fnf.level)
            mult = mult.pow(player.fnf.level.pow(0.25))

            if (player.fnf.level.gte(11) && !hasUpgrade("bs", 82)) mult = mult.mul(mult.pow(0.15))
            if (player.fnf.level.gte(21)) mult = mult.mul(mult.pow(0.20))
            if (player.fnf.level.gte(31)) mult = mult.mul(mult.pow(0.225))
            if (player.fnf.level.gte(41)) mult = mult.mul(mult.pow(0.2375))
            
            player.fnf.prevCost = mult

            //calculate effects
            let E1softcap1 = new Decimal(0.1)
            let E1softcap1Start = new Decimal("1e800")

            let E2softcap1 = new Decimal(0.1)
            let E2softcap1Start = new Decimal("1e1250")

            mult = player.fnf.level.add(1)
            mult = mult.mul(mult.pow(0.5))
            mult = mult.pow(24)

            if (hasUpgrade("fnf", 41)) mult = mult.pow(upgradeEffect("fnf", 41))

            if (mult.gte(E1softcap1Start)) mult = mult.pow(E1softcap1).mul(new Decimal(E1softcap1Start).pow(decimalOne.sub(E1softcap1))) //softcap

            player.fnf.levelEffect1 = Decimal.max(1, mult)
            
            mult = player.fnf.level.add(1)
            mult = mult.mul(mult.pow(0.75))
            mult = mult.pow(32)

            if (hasUpgrade("fnf", 41)) mult = mult.pow(upgradeEffect("fnf", 41))

            if (mult.gte(E2softcap1Start)) mult = mult.pow(E2softcap1).mul(new Decimal(E2softcap1Start).pow(decimalOne.sub(E2softcap1))) //softcap

            player.fnf.levelEffect2 = Decimal.max(1, mult)
            
            mult = player.fnf.level.add(1)
            mult = mult.mul(mult.pow(1.25))
            mult = mult.pow(40)
            
            if (hasMilestone("tvc", 16)) mult = mult.pow(2)

            if (hasMilestone("tvc", 15)) player.fnf.levelEffect3 = Decimal.max(1, mult)
            else player.fnf.levelEffect3 = new Decimal(1)
        }
    },

    glowColor() {
        let layer = "fnf"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [
            11, 12
        ]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "fnf"
        for (const id of [
            11, 12
        ]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return true
            }
        }
        return false
    },

    tooltip() {
        text = format(player.fnf.points) + " Funk Points (+" + format(getResetGain("fnf")) + " Funk Points on reset)"
        if (!canReset(this.layer)) text = format(player.fnf.points) + " Funk Points (\"Ascend to a Lower Reality\" needed to reset)"
        return text
    },
})