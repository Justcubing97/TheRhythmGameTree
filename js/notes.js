addLayer("n", {
    name: "n", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "♪", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),

        whole: new Decimal(0),
        half: new Decimal(0),
        quarter: new Decimal(0),
        eighth: new Decimal(0),

        wholeGain: new Decimal(0),
        halfGain: new Decimal(0),
        quarterGain: new Decimal(0),
        eighthGain: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"),
        softcap2: new Decimal(0.1),
        softcap2Start: new Decimal("1e20000"),
        softcap3: new Decimal(0.05),
        softcap3Start: new Decimal("1e500000"),
    }},
    color: "#EEEEEE",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Notes", // Name of prestige currency
    baseResource: "Musical Essence", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        if (hasAchievement("a", 16)) mult = mult.add(100)

        layer = "n"
        if (hasUpgrade(layer, 41)) mult = mult.add(3)

        layer = "s"
        if (hasUpgrade(layer, 14)) mult = mult.add(15)
        //mul
        if (hasAchievement("a", 16)) mult = mult.mul(100)

        layer = "n"
        if (hasUpgrade(layer, 13)) mult = mult.mul(3)
        if (hasUpgrade(layer, 14)) mult = mult.mul(4)
        if (hasUpgrade(layer, 22)) mult = mult.mul(upgradeEffect(this.layer, 22))
        if (hasUpgrade(layer, 31)) mult = mult.mul(10)
        if (hasUpgrade(layer, 33)) mult = mult.mul(upgradeEffect(this.layer, 33))
        if (hasUpgrade(layer, 34)) mult = mult.mul(4)
        if (hasUpgrade(layer, 103)) mult = mult.mul(5)
        if (hasUpgrade(layer, 104)) mult = mult.mul(25)
        if (hasUpgrade(layer, 41)) mult = mult.mul(25)
        if (hasUpgrade(layer, 302)) mult = mult.mul(upgradeEffect(layer, 302))

        mult = mult.mul(buyableEffect(this.layer, 11))

        layer = "s"
        if (hasMilestone(layer, 3)) mult = mult.mul(500)
        if (hasUpgrade(layer, 23)) mult = mult.mul(125)
        if (hasMilestone(layer, 8)) mult = mult.mul("1e10")
        if (hasUpgrade(layer, 33)) mult = mult.mul("1e21")
        if (hasChallenge(layer, 12)) mult = mult.mul("1e15")

        layer = "ddr"
        if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
        if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

        mult = mult.mul(player.ddrm.gEffect)

        if (player.ddrfc.points.gte(2)) mult = mult.mul("1e10")
        if (player.ddrfc.points.gte(3)) mult = mult.mul("1e10")
        if (player.ddrfc.points.gte(4)) mult = mult.mul("1e100")

        //exp 
        layer = "n"
        if (hasUpgrade(this.layer, 201)) mult = mult.pow(1.05)

        layer = "s"

        layer = "ddr"
        if (hasMilestone(layer, 2)) mult = mult.pow(1.1)
            
        layer = "bs"
        if (hasUpgrade(layer, 22)) mult = mult.pow(1.15)
        //other hypers
        //time dilations/chals
        layer = "s"
        if (inChallenge(layer, 12)) mult = mult.pow(0.01)
        
        layer = "ddr"
        if (inChallenge(layer, 11)) mult = mult.pow(0.75)
        if (inChallenge(layer, 22)) mult = mult.pow(0.1)
        mult = mult.pow(player.ddr.voltage)

        layer = "bs"
        if (inChallenge(layer, 11)) mult = mult.pow(0.001)
        //softcaps
        //final
        return mult
    }, //do everything inside the gainMult()
    getResetGain() {
        let layer = "n"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let mult = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        player[layer].softcap1 = player[layer].softcap1.div(player.ddr.air)
        if (mult.gte(player[layer].softcap1Start)) mult = mult.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
            
        if (inChallenge("ddr", 32)) mult = mult.add(1).log("1e10")
        mult = mult.mul(buyableEffect("ddr", 33))
    
        player[layer].softcap2 = player[layer].softcap2.div(player.ddr.air)
        if (mult.gte(player[layer].softcap2Start)) mult = mult.pow(player[layer].softcap2).mul(new Decimal(player[layer].softcap2Start).pow(decimalOne.sub(player[layer].softcap2)))

        if (hasUpgrade("n", 51)) mult = mult.mul(upgradeEffect(layer, 51))
        if (player.ddrfc.points.gte(8)) mult = mult.mul("1e50000")
        if (hasUpgrade("n", 401)) mult = mult.pow(1.005)
            
        player[layer].softcap3 = player[layer].softcap3.div(player.ddr.air)
        if (mult.gte(player[layer].softcap3Start)) mult = mult.pow(player[layer].softcap3).mul(new Decimal(player[layer].softcap3Start).pow(decimalOne.sub(player[layer].softcap3)))

        mult = mult.pow(buyableEffect("bs", 71))
        if (inChallenge("tvc", 12)) mult = mult.pow(player.tvc.interFactor)
            
		return mult.floor().max(0);
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "N", description: "SHIFT+N: Reset for Notes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.n.unlocked},
    passiveGeneration() {if (hasUpgrade("s", 14)) return 1
        if (hasUpgrade("bs", 24)) return 1
        else return 0
    },
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasMilestone("s", 2)) keptUpgrades.push(11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34)
        if (hasMilestone("s", 3)) keptUpgrades.push(101, 102, 103, 104, 201, 202, 203, 204)

        if (hasUpgrade("n", 301)) keptUpgrades.push(301)
        if (hasUpgrade("n", 302)) keptUpgrades.push(302)
        if (hasUpgrade("n", 303)) keptUpgrades.push(303)
        if (hasUpgrade("n", 304)) keptUpgrades.push(304)

        if (hasUpgrade("ddr", 42)) keptUpgrades.push(41, 42, 43, 44, 111, 112, 113, 114)

        if (hasUpgrade("n", 214)) keptUpgrades.push(211, 212, 213, 214)

        if (hasUpgrade("n", 311)) keptUpgrades.push(311)
        if (hasUpgrade("n", 312)) keptUpgrades.push(312)
        if (hasUpgrade("n", 313)) keptUpgrades.push(313)
        if (hasUpgrade("n", 314)) keptUpgrades.push(314)
            
        if (resettingLayer == "bs") keptUpgrades = []
        
        if (hasUpgrade("n", 54)) keptUpgrades.push(51, 52, 53, 54)
        if (hasUpgrade("n", 401)) keptUpgrades.push(401)
        if (hasUpgrade("n", 402)) keptUpgrades.push(402)
        if (hasUpgrade("n", 403)) keptUpgrades.push(403)
        if (hasUpgrade("n", 404)) keptUpgrades.push(404)
        if (hasUpgrade("n", 411)) keptUpgrades.push(411)
        if (hasUpgrade("n", 412)) keptUpgrades.push(412)
        if (hasUpgrade("n", 413)) keptUpgrades.push(413)
        if (hasUpgrade("n", 414)) keptUpgrades.push(414)

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.points)} Musical Essence.`}],
                "blank",
                ["upgrades", [1, 2, 3, 4, 5]],
                ["blank", "25px"],
                ["display-text", function(){if (hasUpgrade("n", 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)) return `You have <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.whole)}</h2> Whole Notes <br> (${format(player.n.wholeGain)}/sec)`; else return}],
                ["display-text", function(){if (hasUpgrade("n", 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)) return `<span style="color:#BBBBBB">Start gaining Whole Notes at 1e12 Notes!`; else return}],
                ["display-text", function(){if (player.n.whole.gte("1e500")) return `<span style="color:#AAAAAA">Whole Note gain is softcapped by ^0.25 after 1e500!`; else return}],
                "blank",
                ["upgrades", [10, 11]],
                ["blank", function() {if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)) return ["1px", "30px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)) return `You have <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.half)}</h2> Half Notes <br> (${format(player.n.halfGain)}/sec)`; else return}],
                ["display-text", function(){if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)) return `<span style="color:#BBBBBB">Start gaining Half Notes at 1e18 Notes!`; else return}],
                ["display-text", function(){if (player.n.half.gte("1e500")) return `<span style="color:#AAAAAA">Half Note gain is softcapped by ^0.25 after 1e500!`; else return}],
                "blank",
                ["upgrades", [20, 21]],
                ["blank", function() {if (hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)) return ["1px", "30px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)) return `You have <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.quarter)}</h2> Quarter Notes <br> (${format(player.n.quarterGain)}/sec)`; else return}],
                ["display-text", function(){
                    let et = ""
                    if (hasMilestone("ddr", 6)) et = "no longer"
                    if (hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)) return `<span style="color:#BBBBBB">Start gaining Quarter Notes at 1e450 Notes - gain is ${et} logarithmic.`; else return
                }],
                "blank",
                ["upgrades", [30, 31]],
                ["blank", function() {if (hasUpgrade("n", 54)) return ["1px", "30px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (hasUpgrade("n", 54)) return `You have <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.eighth)}</h2> Eighth Notes <br> (${format(player.n.eighthGain)}/sec)`; else return}],
                ["display-text", function(){if (hasUpgrade("n", 54)) return `<span style="color:#BBBBBB">Eighth Note gain is dependent on Quarter Notes!`; else return}],
                ["display-text", function(){if (player.n.eighth.gte("1e500")) return `<span style="color:#AAAAAA">Eighth Note gain is softcapped by ^0.25 after 1e100!`; else return}],
                "blank",
                ["upgrades", [40, 41]],
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.points)} Musical Essence.`}],
                "blank",
                "buyables",
            ],
            unlocked() {return hasUpgrade("s", 21) || hasUpgrade("ddr", 13)},
        },
    },

    upgrades: {
        11: {
            title: "The Simple Ascent",
            description: "x3 Musical Essence.",
            cost: new Decimal("1"),
            unlocked() {return true},
        },
        12: {
            title: "Feel the Tempo",
            effect() {
                let base = player.n.points.add(1)
                base = base.pow(0.25)
                if (hasUpgrade(this.layer, 24)) base = base.mul(3)
                if (hasUpgrade(this.layer, 24)) base = base.pow(1.25)

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e25")
                if (hasMilestone("s", 6)) softcapStart = softcapStart.mul("1e25")
                if (hasUpgrade(this.layer, 213)) softcapStart = softcapStart.mul(upgradeEffect(this.layer, 213))

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text =  "x" + format(upgradeEffect(this.layer, this.id)) + " ME"
                return text
            },
            description: "Notes boost Musical Essence.",
            cost: new Decimal("3"),
            unlocked() {return true},
        },
        13: {
            title: "Feedback Loop",
            description: "x3 Notes.",
            cost: new Decimal("5"),
            unlocked() {return true},
        },
        14: {
            title: "4K Setup",
            description: "x4 Notes and ME.",
            cost: new Decimal("20"),
            unlocked() {return true},
        },

        21: {
            title: "Row 2!",
            description: "x3! ME.",
            cost: new Decimal("300"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        22: {
            title: "More Dynamic Boosts",
            effect() {
                let base = player.points.add(1)
                base = base.pow(0.15)
                if (hasUpgrade(this.layer, 24)) base = base.mul(2)
                if (hasUpgrade(this.layer, 32)) base = base.mul(15)

                if (hasUpgrade(this.layer, 24)) base = base.pow(1.25)
                if (hasUpgrade("ddr", 14)) base = base.pow(1.5).mul("1e10")

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e100")
                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " Notes"
                return text
            },
            description: "ME boosts Notes.",
            cost: new Decimal("1000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        23: {
            title: "Base-ic Manipulation",
            description: "+6 to ME base.",
            cost: new Decimal("4000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        24: {
            title: "Improvement",
            description: "Improve \"Feel the Tempo\" and \"More Dynamic Boosts.\"",
            cost: new Decimal("15000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },

        31: {
            title: "Advanced Pitch Training",
            description: "x10 Notes. Wow!",
            cost: new Decimal("1e5"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        32: {
            title: "Scale Mastery",
            description: "x15 to \"More Dynamic Boosts\" effect.",
            cost: new Decimal("3e6"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        33: {
            title: "Sheet Music Discovery",
            effect() {
                let base = player.n.points.add(1)
                let lb = new Decimal(1.4)
                if (hasUpgrade(this.layer, 103)) lb = new Decimal(1.05)

                base = base.log(lb).add(2).div(2)

                if (hasUpgrade("ddr", 33)) base = base.pow(upgradeEffect("ddr", 33))
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Notes"},
            description: "Notes boost themselves.",
            cost: new Decimal("2e8"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        34: {
            title: "4 Beats",
            description: "Unlock Whole Notes and x4 ME and Notes.",
            cost: new Decimal("1e10"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },

        41: {
            title: "DAW Arpeggiator",
            description: "x25 Notes, WN, and HN",
            cost: new Decimal("1e40"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        42: {
            title: "Rhythm Expert",
            description: "x1000 ME and x1.25 Songs!",
            cost: new Decimal("1e48"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        43: {
            title: "Not Half as Good",
            effect() {
                let base = player.n.half.add(1)
                let lb = new Decimal(1.75)
                base = base.log(lb).pow(1.5).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME"},
            description: "Half Notes boost ME.",
            cost: new Decimal("1e60"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        44: {
            title: "Full Square Timewall",
            description: "Trust me, the wait is worth it! x2500 ME and x500 WN.",
            cost: new Decimal("1e80"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },

        51: {
            title: "Cubic Note",
            effect() {
                let base = player.bs.points.add(1)
                base = base.pow(1000)

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e10000")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Notes"},
            description: "Cubes boost Notes after second softcap.",
            cost: new Decimal("1e108000"),
            unlocked() {return hasMilestone("s", 11)},
        },
        52: {
            title: "Other Way Around",
            effect() {
                let base = player.n.points
                base = base.add(1).log(2).add(1).log(2).add(1)

                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Cubes"},
            description: "Notes boost Cubes.",
            cost: new Decimal("1e120000"),
            unlocked() {return hasMilestone("s", 11)},
        }, 
        53: {
            title: "3/4 Time Signature",
            description: "x3 Beat Saber combo gain, x4 Cubes.",
            cost: new Decimal("1e222222"),
            unlocked() {return hasMilestone("s", 11)},
        },
        54: {
            title: "Syncopation",
            description: "Unlock Eighth Notes and keep this row.",
            cost: new Decimal("1e400000"),
            unlocked() {return hasMilestone("s", 11)},
        },



        101: {
            title: "Slow and Steady",
            description: "+3 ME and Notes.",
            cost: new Decimal("5"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        102: {
            title: "Whole > Parts",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.5)
                if (hasUpgrade(this.layer, 304)) base = base.mul("1e25").pow(1.005)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME"},
            description: "Whole Notes boost ME.",
            cost: new Decimal("60"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        103: {
            title: "Triple Effect",
            description: "Improve \"Sheet Music Discovery\", +10 ME, and x5 Notes!",
            cost: new Decimal("250"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        104: {
            title: "BIG Multiplier",
            description: "x25 Notes! The next layer is at 1e20 Notes.",
            cost: new Decimal("1e4"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        111: {
            title: "Googol's Buyable",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.05).mul(1.5)
                if (hasUpgrade("s", 24)) base = base.mul(4).pow(1.1)
                
                return base
            },
            effectDisplay() {return `<span style="font-size:10px">÷${format(upgradeEffect(this.layer, this.id))} to cost</span>`},
            description: `<span style="font-size:10px">Whole Notes lower the cost of the first Note buyable.</span>`,
            cost: new Decimal("1e100"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        112: {
            title: "BIGGER Multiplier",
            description: "x20,000 ME and x1.1 Songs.",
            cost: new Decimal("1e110"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        113: {
            title: "Music Mastery",
            description: "Improve \"Composition\" and \"Music Experience\".",
            cost: new Decimal("1e120"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        114: {
            title: "Quirky Rhythms",
            effect() {
                let base = player.points.add(1)
                base = base.log(1.25).add(1)
    
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " WN and HN"},
            description: "ME boosts WN and HN.",
            cost: new Decimal("1e130"),
            currencyDisplayName: "Whole Notes",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },

        201: {
            title: "Exponent Time!",
            description: "^1.05 ME and Notes.",
            cost: new Decimal("1000"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        202: {
            title: "Musical Multi",
            description: "x500 ME.",
            cost: new Decimal("5e6"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        203: {
            title: "Whole Expansion",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.01)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " HN"},
            description: "Whole Notes boost Half Notes.",
            cost: new Decimal("1e10"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        204: {
            title: "Efficient Workspace",
            description: "x1.5 Songs.",
            cost: new Decimal("1e18"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14) || hasUpgrade("bs", 14)},
        },
        211: {
            title: "Collaborations!",
            description: "x1.2 Songs.",
            cost: new Decimal("1e512"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21) || hasUpgrade("bs", 14)},
        },
        212: {
            title: "Musical Lock-in",
            description: "Highest DDR combo's effect is improved.",
            cost: new Decimal("1e540"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21) || hasUpgrade("bs", 14)},
        },
        213: {
            title: "Delayed Reduction",
            effect() {
                let base = player.n.half.add(1)
                base = base.pow(0.05)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " to softcap start"},
            description: "Half Notes delay the softcap of \"Feel the Tempo\".",
            cost: new Decimal("1e570"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21) || hasUpgrade("bs", 14)},
        },
        214: {
            title: "Dance Hardcore",
            description: "Unlock \"EXPERT\" and keep this row.",
            cost: new Decimal("1e590"),
            currencyDisplayName: "Half Notes",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21) || hasUpgrade("bs", 14)},
        },
    
        301: {
            title: "Can you Count to 4?",
            description: "x4 all arrow gains and DDR combo gains.",
            cost: new Decimal("75"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)},
        },
        302: {
            title: "4/4 Time Signature",
            effect() {
                let base = player.n.quarter.add(1)
                base = base.log(1.001).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME and Notes"},
            description: "Quarter Notes boost ME and Notes.",
            cost: new Decimal("1250"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)},
        },
        303: {
            title: "Triple Currency Boost",
            description: "x10 QN, DDR combo gain, and Arrows. Keep \"Power Outage\" completed.",
            cost: new Decimal("5000"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)},
        },
        304: {
            title: "Simple Ode to Joy",
            description: "Melodic fashion! Improve \"Whole > Parts\" and ^1.15 ME.",
            cost: new Decimal("250000"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32) || hasUpgrade("bs", 14)},
        },
        311: {
            title: "Groove Energy",
            description: "Lower the threshold of Groove Power to 1e300.",
            cost: new Decimal("1e7"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31) || hasUpgrade("bs", 14)},
        },
        312: {
            title: "DDR Cabinet Discount",
            description: "Improve \"⇧ ÷ → ♪ 💵\".",
            cost: new Decimal("75e6"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31) || hasUpgrade("bs", 14)},
        },
        313: {
            title: "Even Faster Production",
            effect() {
                let base = player.n.quarter.add(1)
                base = base.pow(0.01)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Songs"},
            description: "Quarter Notes boost Songs.",
            cost: new Decimal("1e10"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31) || hasUpgrade("bs", 14)},
        },
        314: {
            title: "ATTACK!! PERFECT FULL COMBO!",
            description: "Unlock \"Full Combo\".",
            cost: new Decimal("1e13"),
            currencyDisplayName: "Quarter Notes",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31) || hasUpgrade("bs", 14)},
        },



        401: {
            title: "The Last of the Basics",
            description: "^1.005 Notes after second softcap.",
            cost: new Decimal("100"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("n", 54)},
        },
        402: {
            title: "Quantization",
            effect() {
                let base = player.n.eighth.add(1)
                base = base.pow(2)

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e50")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Arrows"},
            description: "Eighth Notes boost Arrows after first softcap.",
            cost: new Decimal("20e6"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("n", 54)},
        },
        403: {
            title: "<i>click click</i>",
            description: "+2 max tiles in the Distance layer.",
            cost: new Decimal("1e20"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("n", 54)},
        },
        404: {
            title: "Upgrade 404 Not Found",
            description: "Heavily improve Movement's effect.",
            cost: new Decimal("1e38"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("n", 54)},
        },

        411: {
            title: "Musical Distancing",
            effect() {
                let base = player.d.points.add(1)
                base = base.pow(0.75)

                let softcap = new Decimal(0.35)
                let softcapStart = new Decimal("1e15")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " Songs"},
            description: "Distance boosts Songs.",
            cost: new Decimal("1e54"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 12)},
        },
        412: {
            title: "man i hate softcaps",
            description: "^1.02 Arrows after first softcap.",
            cost: new Decimal("1e63"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 12)},
        },
        413: {
            title: "MUSIC = EUPHORIA",
            description: "^1.25 ME after third softcap.",
            cost: new Decimal("1e70"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 12)},
        },
        414: {
            title: "Simple (not) Rhythms",
            effect() {
                let base = player.n.eighth.add(1)
                base = base.pow(5)

                let softcap = new Decimal(0.2)
                let softcapStart = new Decimal("1e500")

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " QN"},
            description: "Eighth Notes boost Quarter Notes.",
            cost: new Decimal("1e80"),
            currencyDisplayName: "Eighth Notes",
            currencyInternalName: "eighth",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 12)},
        },
    },

    buyables: {
        11: {
            base() {return new Decimal("1e20")},
            exponentialBase() {
                let init = new Decimal("200")
                if (hasMilestone("s", 5)) init = init.sub(75)
                if (inChallenge("s", 11)) init = new Decimal("1e10")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                if (hasUpgrade(this.layer, 111)) final = final.div(upgradeEffect(this.layer, 111))
                if (hasUpgrade("ddr", 23)) final = final.div(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) final = final.div("1e25")
                final = final.div(buyableEffect("ddr", 31))
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Consistent Production",
            display() {
                let base = new Decimal(2)
                if (hasMilestone("s", 9)) base = base.add(1)
                return "Multiplies Notes by " + base + " per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade("ddr", 13) || hasUpgrade("bs", 13)){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal(2)
                if (hasMilestone("s", 9)) base = base.add(1)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 13)},
            buyMax() {
                let timesBought = player.n.points
                timesBought = timesBought.mul(upgradeEffect(this.layer, 111))
                timesBought = timesBought.mul(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) timesBought = timesBought.mul("1e25")
                timesBought = timesBought.mul(buyableEffect("ddr", 31))

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(new Decimal.pow("10", "20"))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = new Decimal.pow("10", "20")
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                totalCost = totalCost.div(upgradeEffect(this.layer, 111))
                totalCost = totalCost.div(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) totalCost = totalCost.div("1e25")
                totalCost = totalCost.div(buyableEffect("ddr", 31))

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },

        12: {
            base() {return new Decimal("1e500")},
            exponentialBase() {
                let init = new Decimal("1e50")
                if (hasMilestone("ddr", 11)) init = new Decimal("1e20")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //if you add anything to the cost formula, make sure to update the buymax()!
            },
            title: "Combo Multiplier",
            display() {
                return "x1.5 DDR combo gain per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade("s", 42) || hasUpgrade("bs", 13)){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal(1.5)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("ddr", 1)},
            buyMax() {
                let timesBought = player.n.points
                //insert cost effects here

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(new Decimal.pow("10", "500"))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = new Decimal.pow("10", "500")
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

    update(diff){
        //whole notes
        if ((hasUpgrade("n", 34) || hasUpgrade("ddr", 14)) && player.n.points.gte("1e12")){
            let mult = player.n.points.div("1e12")
            if (hasMilestone("s", 1)) mult = mult.mul(3)
            if (hasUpgrade(this.layer, 41)) mult = mult.mul(25)
            if (hasUpgrade(this.layer, 44)) mult = mult.mul(500)
            if (hasUpgrade("s", 24)) mult = mult.mul(1000)
            if (hasUpgrade(this.layer, 114)) mult = mult.mul(upgradeEffect(this.layer, 114))

            if (hasMilestone("s", 4)) mult = mult.pow(1.1)
                
            if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.wholeGain = mult
            player.n.whole = player.n.whole.add(player.n.wholeGain.mul(diff))
        }

        //half notes
        if ((hasUpgrade("s", 12) || hasUpgrade("ddr", 14)) && player.n.points.gte("1e18")){
            let mult = player.n.points.div("1e18")
            if (hasUpgrade(this.layer, 203)) mult = mult.mul(upgradeEffect(this.layer, 203))
            if (hasMilestone("s", 1)) mult = mult.mul(5)
            if (hasUpgrade("s", 13)) mult = mult.mul(15)
            if (hasUpgrade(this.layer, 41)) mult = mult.mul(25)
            if (hasUpgrade("s", 22)) mult = mult.mul(upgradeEffect("s", 22))
            if (hasUpgrade(this.layer, 114)) mult = mult.mul(upgradeEffect(this.layer, 114))
            if (hasUpgrade("ddr", 42)) mult = mult.mul("1e10")

            if (hasMilestone("s", 4)) mult = mult.pow(1.01)
                
            if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.halfGain = mult
            player.n.half = player.n.half.add(player.n.halfGain.mul(diff))
        }

        //1/4 notes
        if ((hasUpgrade("ddr", 32)) && player.n.points.gte("1e450")){
            let mult = player.n.points.div("1e450")
            let qnlb = new Decimal(10)
            if (hasChallenge("ddr", 31)) qnlb = qnlb.sub(8)

            if (hasMilestone("ddr", 6)) mult = mult.pow(0.01)
            else mult = mult.add(1).log(qnlb).add(1)

            if (hasUpgrade("n", 303)) mult = mult.mul(10)
            if (hasChallenge("ddr", 22)) mult = mult.mul(5)
            if (hasMilestone("ddr", 4)) mult = mult.mul(15)
            if (hasUpgrade("n", 414)) mult = mult.mul(upgradeEffect("n", 414))
  
            if (hasMilestone("ddr", 2)) mult = mult.pow(1.25)
                
            mult = mult.mul(buyableEffect("bs", 92))

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.quarterGain = mult
            player.n.quarter = player.n.quarter.add(player.n.quarterGain.mul(diff))
        }

        if ((hasUpgrade("n", 54))){
            let mult = player.n.quarter.add(1).log(10).add(1).div(100).add(1)
            if (hasMilestone("s", 14)) mult = player.n.quarter.add(1).pow(0.025).add(1)
            
            mult = mult.mul(buyableEffect("bs", 52))
            mult = mult.mul(buyableEffect("bs", 92))
            
            if (hasUpgrade("d", 31)) mult = mult.mul(10000)
            if (hasUpgrade("d", 32)) mult = mult.mul(20000)
            if (hasUpgrade("d", 33)) mult = mult.mul(40000)
            if (hasUpgrade("d", 34)) mult = mult.mul(80000)
                
            if (hasMilestone("s", 13)) mult = mult.mul("1e6")
                
            if (hasUpgrade("bs", 43)) mult = mult.mul("1e10")

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.eighthGain = mult
            player.n.eighth = player.n.eighth.add(player.n.eighthGain.mul(diff))
        }
    },

    glowColor() {
        let layer = "n"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "n"
        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id) && hasUpgrade("s", 21) && tmp[layer].buyables[id].unlocked) {
                return true
            }
        }
        return false
    },
    automate() {
        let layer = "n"
        if (
            canBuyBuyable(layer, 11) && 
            tmp[layer].buyables[11].unlocked &&
            (hasChallenge("ddr", 21) || hasUpgrade("bs", 13))
        ) tmp[layer].buyables[11].buy()
        if (
            canBuyBuyable(layer, 12) && 
            tmp[layer].buyables[12].unlocked &&
            (hasMilestone("ddr", 12) || hasUpgrade("bs", 13))
        ) tmp[layer].buyables[12].buy()
    },
    autoUpgrade() {return hasUpgrade("bs", 14)},

    branches: [["s", 1]],
    tooltip() {
        let text = format(player.n.points) + " Notes (+" + format(getResetGain("n")) + " Notes on reset)"
        if (player.n.points.gte(player.n.softcap3Start)) text += "<br>[THIRD SOFTCAP - 1e500000]"
        else if (player.n.points.gte(player.n.softcap2Start)) text += "<br>[SECOND SOFTCAP - 1e20000]"
        else if (player.n.points.gte(player.n.softcap1Start)) text += "<br>[FIRST SOFTCAP - 1e1000]"
        return text
    },
})