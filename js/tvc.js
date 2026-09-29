addLayer("tvc", {
    name: "tvc", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🟪", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        effect: new Decimal(1),
        basicFactor: new Decimal(1),
        interFactor: new Decimal(1),
        advancedFactor: new Decimal(1),
        expertFactor: new Decimal(1),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"), //defaults for normal layers
    }},
    color: "#8000FF",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient(45deg, #000000, #8000FF)";
		return style;
	},
    requires: new Decimal(13), // Can be a function that takes requirement increases into account
    resource: "Toxic Violet Cubes", // Name of prestige currency
    baseResource: "Full Combo Tiers", // Name of resource prestige is based on
    baseAmount() {return player.ddrfc.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        mult = mult.mul(buyableEffect(this.layer, 11))
        mult = mult.mul(buyableEffect(this.layer, 12))
        mult = mult.mul(player.tvc.effect)

        layer = "s"
        if (hasMilestone(layer, 16)) mult = mult.mul("1e15")
        
        layer = "bs"
        mult = mult.mul(buyableEffect(layer, 101))
        mult = mult.mul(new Decimal(250).pow(challengeCompletions(layer, 12)))
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //primary multi
    getResetGain() {
        let layer = "tvc"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (gain.gte(player[layer].softcap1Start)) gain = gain.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
        //put after first softcap things after this line
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [ //use shift for currencies, regulars for minigames
        {key: "T", description: "SHIFT+T: Reset for TVC", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("bs", 71)) player.tvc.unlocked = true
        return player.tvc.unlocked
    },
    passiveGeneration() {return true}, //use autoPrestige() if static!
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

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
                ["display-text", function(){return `You are gaining ${format(getResetGain(this.layer))} TVC per second.`}],
                ["display-text", function(){return `Your Toxic Violet Cubes multiply themselves and Cubes by x${format(player.tvc.effect)}`}],
                "blank",
                "buyables",
                "blank",
                "milestones",
            ],
        },
        "Contaminations": {
            content: [
                "main-display",
                ["display-text", function(){return `You are gaining ${format(getResetGain(this.layer))} TVC per second.`}],
                ["display-text", function(){return `Your Toxic Violet Cubes multiply themselves and Cubes by x${format(player.tvc.effect)}`}],
                "blank",
                ["display-text", function(){return `<span style="color: red">Your Basic Contamination Factor is ^${format(player.tvc.basicFactor, 6, true)}</span>`}],
                ["display-text", function(){return `<span style="color: red">Your Intermediate Contamination Factor is ^${format(player.tvc.interFactor, 6, true)}</span>`}],
                ["display-text", function(){return `<span style="color: red">Your Advanced Contamination Factor is ^${format(player.tvc.advancedFactor, 6, true)}</span>`}],
                ["display-text", function(){return `<span style="color: red">Your Expert Contamination Factor is ^${format(player.tvc.expertFactor, 6, true)}</span>`}],
                "blank",
                "challenges",
            ],
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 1 Toxic Violet Cube",
            effectDescription: "A new layer? Unlock the first Toxic buyable.",
            done() { return player.tvc.points.gte(1) },
        },
        2: {
            requirementDescription: "2: 1,250,000 Toxic Violet Cubes",
            effectDescription: "Is this just an inflation layer? +0.5 to the effect base of \"Wrong Color.\".",
            done() { return player.tvc.points.gte(1250000) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        3: {
            requirementDescription: "3: 1e10 Toxic Violet Cubes",
            effectDescription: "Nowhere else but up. Unlock the second Toxic buyable.",
            done() { return player.tvc.points.gte("1e10") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        4: {
            requirementDescription: "4: 1e20 Toxic Violet Cubes",
            effectDescription: "Toxic Violet Cubes are well... toxic. Unlock the Basic Contamination.",
            done() { return player.tvc.points.gte("1e20") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        5: {
            requirementDescription: "5: 1e30 Toxic Violet Cubes",
            effectDescription: "More toxicity! +5 to the effect base of \"Wrong Direction.\" Improve BS Combo's effect.",
            done() { return player.tvc.points.gte("1e20") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        6: {
            requirementDescription: "6: 1e40 Toxic Violet Cubes",
            effectDescription: "Is this just multiplying by 1e10 each time? Unlock the Intermediate Contamination.",
            done() { return player.tvc.points.gte("1e40") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        7: {
            requirementDescription: "7: 1e85 Toxic Violet Cubes",
            effectDescription: "NOPE. The TVC effect now multiplies BS Combo and its effect.",
            done() { return player.tvc.points.gte("1e85") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        8: {
            requirementDescription: "8: 1e180 Toxic Violet Cubes",
            effectDescription: "More Inflation. ^1.1 Arrows after softcap.",
            done() { return player.tvc.points.gte("1e180") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        9: {
            requirementDescription: "9: 1e225 Toxic Violet Cubes",
            effectDescription: "The toxicity is spreading! Unlock the Advanced Contamination.",
            done() { return player.tvc.points.gte("1e225") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        10: {
            requirementDescription: "10: 1e265 Toxic Violet Cubes",
            effectDescription: "The log10 of this requirement is the BPM of Toxic Violet Cubes! x1e10 Cubes.",
            done() { return player.tvc.points.gte("1e265") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
    },
    buyables: {
        11: {
            base() {return new Decimal("1")},
            exponentialBase() {
                let init = new Decimal("3")
                init = init.add(getBuyableAmount(this.layer, this.id))
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                final = final.mul(x.pow(x.add(1).log(10)).add(1))
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Wrong Color.",
            display() {
                return "x3 TVC per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                if (false){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal("3")
                if (hasMilestone(this.layer, 2)) base = base.add(0.5)

                let effect = base.pow(x)
                return effect
            },
            unlocked() {return true},
            buyMax() {
                
            },
        },
        12: {
            base() {return new Decimal("5e9")},
            exponentialBase() {
                let init = new Decimal("4")
                init = init.mul(getBuyableAmount(this.layer, this.id).pow(1.25))
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                final = final.mul(x.pow(x.add(1).log(5)).add(1))
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Wrong Direction.",
            display() {
                return "x10 TVC per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                if (false){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal("10")
                if (hasMilestone(this.layer, 5)) base = base.add(5)

                let effect = base.pow(x)
                return effect
            },
            unlocked() {return true},
            buyMax() {
                
            },
        },
    },

    challenges: {
        11: {
            name: "Basic Contamination",
            challengeDescription: "Toxic Violet Cubes are reset. ME, Songs, and Arrows are raised to your BCF.",
            goalDescription: "Have 50 Arrows.",
            rewardDescription: "Improve highest mission level and TVC effects.",
            canComplete: function() {return player.ddr.points.gte(50)},
            unlocked() {return hasMilestone("tvc", 4)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
        },
        12: {
            name: "Intermediate Contamination",
            challengeDescription: "Toxic Violet Cubes are reset. ME, Notes, and Arrows are raised to your ICF.",
            goalDescription: "Have 50 Notes.",
            rewardDescription: "Improve Bad Cuts' and TVC effects.",
            canComplete: function() {return player.n.points.gte(50)},
            unlocked() {return hasMilestone("tvc", 6)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
        },
        21: {
            name: "Advanced Contamination",
            challengeDescription: "Toxic Violet Cubes are reset. Notes, Songs, and Arrows are raised to your ACF.",
            goalDescription: "Have 50 Arrows.",
            rewardDescription: "Automatically gain Cuts, Bad Cuts, and BS Combo as if you were to manually gain them. x1e12 Cubes.",
            canComplete: function() {return player.ddr.points.gte(50)},
            unlocked() {return hasMilestone("tvc", 9)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
        },
        22: {
            name: "Expert Contamination",
            challengeDescription: "Toxic Violet Cubes, Cubes, Distance, and Movement are reset. Songs are raised to your ECF (no, not Easten Conference Finals, this isn't the NHL).",
            goalDescription: "Have 1e2850 Arrows.",
            rewardDescription: "x1e40 Cubes!",
            canComplete: function() {return player.ddr.points.gte("1e2850")},
            unlocked() {return hasUpgrade("bs", 73)},
            onEnter() {
                player.tvc.points = new Decimal(0)
                player.bs.points = new Decimal(0)
                player.d.points = new Decimal(0)
                player.d.movement = new Decimal(0)
            },
            onExit() {
                player.tvc.points = new Decimal(0)
                player.bs.points = new Decimal(0)
                player.d.points = new Decimal(0)
                player.d.movement = new Decimal(0)
            },
        },
    },

    update(diff){
        let mult = player.tvc.points.add(1)

        mult = mult.log(2).add(1)
        if (hasChallenge("tvc", 11)) mult = mult.mul(player.tvc.points.add(1).log(10)).pow(1.5)
        if (hasChallenge("tvc", 12)) mult = mult.mul(player.tvc.points.add(1).log(2)).pow(1.5)

        player.tvc.effect = mult

        //contamination factors
        mult = player.tvc.points.add(1)

        mult = new Decimal(1).div(mult.pow(0.2))

        player.tvc.basicFactor = mult
        
        mult = player.tvc.points.add(1)

        mult = new Decimal(1).div(mult.pow(0.5))

        player.tvc.interFactor = mult
        
        mult = player.tvc.points.add(1)

        mult = new Decimal(1).div(mult.pow(0.8))

        player.tvc.advancedFactor = mult
        
        mult = player.tvc.points.add(1)

        mult = new Decimal(1).div(mult.pow(1.1))

        player.tvc.expertFactor = mult
    },

    tooltip() {return format(player.tvc.points) + " Toxic Violet Cubes (+" + format(getResetGain("tvc")) + " TVC/s)"},
})