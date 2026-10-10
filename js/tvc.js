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

        if (hasChallenge("tvc", 33)) mult = mult.mul("1e20")

        layer = "s"
        if (hasMilestone(layer, 16)) mult = mult.mul("1e15")
        
        layer = "bs"
        mult = mult.mul(buyableEffect(layer, 101))
        mult = mult.mul(new Decimal(250).pow(challengeCompletions(layer, 12)))

        layer = "d"
        if (hasUpgrade(layer, 81)) mult = mult.mul("1e10")
        if (hasUpgrade(layer, 82)) mult = mult.mul("1e15")
        if (hasUpgrade(layer, 83)) mult = mult.mul("1e20")
        if (hasUpgrade(layer, 84)) mult = mult.mul("1e25")
        
        layer = "fnf"
        if (hasMilestone(layer, 1)) mult = mult.mul("1e10")
        if (hasMilestone(layer, 8)) mult = mult.mul(player.ddrm.aEffect)
        //exp 
        mult = mult.pow(buyableEffect(this.layer, 22))
        if (hasMilestone(this.layer, 12)) mult = mult.pow(1.15)
        
        if (inChallenge(this.layer, 13)) mult = mult.pow(0.01)
        if (inChallenge(this.layer, 23)) mult = mult.pow(0.01)
        if (inChallenge(this.layer, 31)) mult = mult.pow(0.01)
        if (inChallenge(this.layer, 32)) mult = mult.pow(0.01)
        if (inChallenge(this.layer, 33)) mult = mult.pow(0.01)
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
        if (hasUpgrade("d", 111)) gain = gain.pow(1.01)
        if (hasUpgrade("d", 112)) gain = gain.pow(1.02)
        if (hasUpgrade("d", 113)) gain = gain.pow(1.03)
        if (hasUpgrade("d", 114)) gain = gain.pow(1.04)
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
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
        if (hasMilestone("fnf", 4)) keptBuyables.push(getBuyableAmount(this.layer, 11), getBuyableAmount(this.layer, 12), getBuyableAmount(this.layer, 21), getBuyableAmount(this.layer, 22))

        let keptChallenges = []
        if (hasMilestone("fnf", 4)) keptChallenges.push(11, 12, 21, 22)
        if (hasMilestone("fnf", 8)) keptChallenges.push(13, 23, 31, 32)
        if (hasChallenge("tvc", 33)) keptChallenges.push(33)

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        keptChallenges.forEach(element => player[this.layer].challenges[element] = 1)
        
        if (hasMilestone("fnf", 4)){
            setBuyableAmount(this.layer, 11, keptBuyables[0])
            setBuyableAmount(this.layer, 12, keptBuyables[1])
            setBuyableAmount(this.layer, 21, keptBuyables[2])
            setBuyableAmount(this.layer, 22, keptBuyables[3])
        }
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
            unlocked() {return hasMilestone("tvc", 4)}
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
            done() { return player.tvc.points.gte("1e30") },
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
        11: {
            requirementDescription: "11: 1e300 Toxic Violet Cubes",
            effectDescription: "You will most likely get this while playing FNF. Unlock the third and fourth Toxic buyables.",
            done() { return player.tvc.points.gte("1e300") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        12: {
            requirementDescription: "12: 1e480 Toxic Violet Cubes",
            effectDescription: "^1.15 TVC. Unlock the Convoluted Contaminations.",
            done() { return player.tvc.points.gte("1e480") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        13: {
            requirementDescription: "13: 1e1100 Toxic Violet Cubes",
            effectDescription: "The TVC effect multiplies Movement and Cubes. Unlock another Toxic buyable. Marvelous arrows restore an additional 10% of player health, Great arrows restore an additional 5%, and Almost arrows restore +3%.",
            done() { return player.tvc.points.gte("1e1100") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) }
        },
        14: {
            requirementDescription: "13: 1e1385 Toxic Violet Cubes",
            effectDescription: "Weaken the second softcap of DDR Minigame Arrow gains. ^1.025 Songs.",
            done() { return player.tvc.points.gte("1e1385") },
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

                final = final.div(buyableEffect(this.layer, 31))

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
                base = base.add(buyableEffect(this.layer, 21))

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

                final = final.div(buyableEffect(this.layer, 31))

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
                base = base.add(buyableEffect(this.layer, 21))

                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("tvc", 3)},
            buyMax() {
                
            },
        },
        21: {
            base() {return new Decimal("1e300")},
            exponentialBase() {
                let init = new Decimal("4")
                init = init.pow(getBuyableAmount(this.layer, this.id).add(1))
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                final = final.mul(x.pow(x.add(1).mul(1.5)).add(1))

                final = final.div(buyableEffect(this.layer, 31))

                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Do Not Cut These Bombs With Your Sabers.",
            display() {
                return "+0.1 to the bases of the above two buyables per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: +" + format(this.effect())
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
                let base = new Decimal("0.1")

                let effect = base.mul(x)
                return effect
            },
            unlocked() {return hasMilestone("tvc", 11)},
            buyMax() {
                
            },
        },
        22: {
            base() {return new Decimal("1e300")},
            exponentialBase() {
                let init = new Decimal("1e3")
                init = init.pow(getBuyableAmount(this.layer, this.id).pow(2).add(1))
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                final = final.mul(x.pow(x.div(2).add(1)).add(1))

                final = final.div(buyableEffect(this.layer, 31))

                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Lean Left. Lean Right.",
            display() {
                return "^1.01 TVC per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + format(this.effect())
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
                let base = new Decimal("1.01")

                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("tvc", 11)},
            buyMax() {
                
            },
        },
        31: {
            base() {return new Decimal("5e1099")},
            exponentialBase() {
                let init = new Decimal("1e5")
                init = init.pow(getBuyableAmount(this.layer, this.id).pow(3).add(1))
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                final = final.mul(x.pow(x.div(1.75).pow(1.05)).add(1))
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "We Feel The Beat.",
            display() {
                return "Divide the first four Toxic buyable costs by ÷1e50 per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ÷" + format(this.effect())
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
                let base = new Decimal("1e50")

                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("tvc", 13)},
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
        
        13: {
            name: "Convoluted Contamination 1",
            challengeDescription: "Toxic Violet Cubes are reset. ^0.01 TVC. Experience the effects of Basic and Intermediate Contamination.",
            goalDescription: "Have 200 Notes.",
            rewardDescription: "All Contamination Factors are weaker. x1e200 Arrows after second softcap.",
            canComplete: function() {return player.n.points.gte(200)},
            unlocked() {return hasMilestone("tvc", 12)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
            countsAs: [11, 12]
        },
        23: {
            name: "Convoluted Contamination 2",
            challengeDescription: "Toxic Violet Cubes are reset. ^0.01 TVC. Experience the effects of Advanced and Expert Contamination.",
            goalDescription: "Have 1e540 Eighth Notes.",
            rewardDescription: "All Contamination Factors are weaker. The first Arrow softcap is at 1e500 and raise the exponent to ^0.5.",
            canComplete: function() {return player.n.eighth.gte("1e540")},
            unlocked() {return hasMilestone("tvc", 12)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
            countsAs: [21, 22]
        },
        31: {
            name: "Convoluted Contamination 3",
            challengeDescription: "Toxic Violet Cubes are reset. ^0.01 TVC. Experience the effects of Basic and Advanced Contamination.",
            goalDescription: "Have 1e340 Arrows.",
            rewardDescription: "Drastically improve Cuts' effect. x1e50 Cuts and BS Combo.",
            canComplete: function() {return player.ddr.points.gte("1e340")},
            unlocked() {return hasMilestone("tvc", 12)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
            countsAs: [11, 21]
        },
        32: {
            name: "Convoluted Contamination 4",
            challengeDescription: "Toxic Violet Cubes are reset. ^0.01 TVC. Experience the effects of Intermediate and Expert Contamination.",
            goalDescription: "Have 1e565 Half Notes.",
            rewardDescription: "x1e100 BS Combo. ^1.01 ME after third softcap.",
            canComplete: function() {return player.n.half.gte("1e565")},
            unlocked() {return hasMilestone("tvc", 12)},
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
            countsAs: [12, 22]
        },
        33: {
            name: "Super Convoluted Contamination",
            challengeDescription: "Toxic Violet Cubes are reset. ^0.01 TVC. Experience the effects of all Contaminations.",
            goalDescription: "Have 1e260 Arrows.",
            rewardDescription: "All Contamination Factors are weaker. x1e20 TVC, +15% max player health, x1e33 Distance, and x1e10 max Stamina. <i>This Contamination only has to be completed once.</i>",
            canComplete: function() {return player.ddr.points.gte("1e260")},
            unlocked() {return hasMilestone("tvc", 12)},
            onEnter() {player.tvc.points = new Decimal(0)},
            onExit() {player.tvc.points = new Decimal(0)},
            countsAs: [11, 12, 21, 22]
        },
    },

    update(diff){
        let mult = player.tvc.points.add(1)

        mult = mult.log(2).add(1)
        if (hasChallenge("tvc", 11)) mult = mult.mul(player.tvc.points.add(1).log(10)).pow(1.5).add(1)
        if (hasChallenge("tvc", 12)) mult = mult.mul(player.tvc.points.add(1).log(2)).pow(1.5).add(1)
        if (hasMilestone("fnf", 3)) mult = mult.mul(player.tvc.points.add(1).log("1e10").mul(getBuyableAmount(this.layer, 11).mul(getBuyableAmount(this.layer, 12)))).add(1)
        if (hasMilestone("fnf", 11)) mult = mult.mul(player.tvc.points.add(1).log(1.1)).add(1)
        if (hasMilestone("fnf", 14)) mult = mult.mul(player.tvc.points.add(1).pow(0.01)).add(1)

        player.tvc.effect = mult

        //contamination factors
        let CFExp = new Decimal(1)

        mult = player.tvc.points.add(1)
        CFExp = new Decimal(0.2)

        if (hasChallenge(this.layer, 13)) CFExp = CFExp.sub(0.15)
        if (hasChallenge(this.layer, 23)) CFExp = CFExp.sub(0.04)

        mult = new Decimal(1).div(mult.pow(CFExp))
        
        if (hasMilestone("fnf", 7)) mult = mult.pow(0.85)
        if (hasUpgrade("fnf", 23)) mult = mult.pow(upgradeEffect("fnf", 23))
        if (player.ddrfc.points.gte(23)) mult = mult.pow(0.75)
        if (hasChallenge("tvc", 33)) mult = mult.pow(0.9)
        
        player.tvc.basicFactor = mult
        //================================================
        mult = player.tvc.points.add(1)
        CFExp = new Decimal(0.5)

        if (hasChallenge(this.layer, 13)) CFExp = CFExp.sub(0.3)
        if (hasChallenge(this.layer, 23)) CFExp = CFExp.sub(0.08)

        mult = new Decimal(1).div(mult.pow(CFExp))
        
        if (hasMilestone("fnf", 7)) mult = mult.pow(0.85)
        if (hasUpgrade("fnf", 23)) mult = mult.pow(upgradeEffect("fnf", 23))
        if (player.ddrfc.points.gte(23)) mult = mult.pow(0.75)
        if (hasChallenge("tvc", 33)) mult = mult.pow(0.9)

        player.tvc.interFactor = mult
        //================================================
        mult = player.tvc.points.add(1)
        CFExp = new Decimal(0.8)

        if (hasChallenge(this.layer, 13)) CFExp = CFExp.sub(0.45)
        if (hasChallenge(this.layer, 23)) CFExp = CFExp.sub(0.12)

        mult = new Decimal(1).div(mult.pow(CFExp))
        
        if (hasMilestone("fnf", 7)) mult = mult.pow(0.85)
        if (hasUpgrade("fnf", 23)) mult = mult.pow(upgradeEffect("fnf", 23))
        if (player.ddrfc.points.gte(23)) mult = mult.pow(0.75)
        if (hasChallenge("tvc", 33)) mult = mult.pow(0.9)

        player.tvc.advancedFactor = mult
        //================================================
        mult = player.tvc.points.add(1)
        CFExp = new Decimal(1.1)

        if (hasChallenge(this.layer, 13)) CFExp = CFExp.sub(0.6)
        if (hasChallenge(this.layer, 23)) CFExp = CFExp.sub(0.16)

        mult = new Decimal(1).div(mult.pow(CFExp))
        
        if (hasMilestone("fnf", 7)) mult = mult.pow(0.85)
        if (hasUpgrade("fnf", 23)) mult = mult.pow(upgradeEffect("fnf", 23))
        if (player.ddrfc.points.gte(23)) mult = mult.pow(0.75)
        if (hasChallenge("tvc", 33)) mult = mult.pow(0.9)

        player.tvc.expertFactor = mult

        //fnf things
        mult = new Decimal("1e1000")
        if (hasUpgrade("fnf", 13)) mult = mult.mul(upgradeEffect("fnf", 13))
        if (hasMilestone("fnf", 12)) mult = mult.mul("1e100")
        player.tvc.softcap1Start = mult
    },
    branches: [["fnf", 1]],

    tooltip() {
        let text = format(player.tvc.points) + " Toxic Violet Cubes (+" + format(getResetGain("tvc")) + " TVC/s)"
        if (player.tvc.points.gte(player.tvc.softcap1Start)) text += `<br>[FIRST SOFTCAP - ${format(player.tvc.softcap1Start)}]`
        return text
    },
})