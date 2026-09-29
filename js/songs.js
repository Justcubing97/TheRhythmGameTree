addLayer("s", {
    name: "s", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🎧", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),

        resetting: true,
    }},
    color: "#80FFB0",
    requires() {
        if (inChallenge("ddr", 12)) return new Decimal("10").tetrate("1e100")
        return new Decimal("1e20")
    }, // Can be a function that takes requirement increases into account
    resource: "Songs", // Name of prestige currency
    baseResource: "Notes", // Name of resource prestige is based on
    baseAmount() {return player.n.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    base: 10,
    directMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        layer = "n"
        layer = "s"
        if (hasMilestone(layer, 5)) mult = mult.add(1)
        if (hasChallenge(layer, 12)) mult = mult.add(0.5)
        //mul
        if (hasAchievement("a", 36)) mult = mult.mul(500)

        layer = "n"
        if (hasUpgrade(layer, 204)) mult = mult.mul(1.5)
        if (hasUpgrade(layer, 211)) mult = mult.mul(1.2)
        if (hasUpgrade(layer, 42)) mult = mult.mul(1.25)
        if (hasUpgrade(layer, 112)) mult = mult.mul(1.1)
        if (hasUpgrade(layer, 313)) mult = mult.mul(upgradeEffect(layer, 313))
        if (hasUpgrade(layer, 411)) mult = mult.mul(upgradeEffect(layer, 411))

        layer = "ddr"
        if (hasChallenge(layer, 11)) mult = mult.mul(1.25)
        if (hasMilestone(layer, 1)) mult = mult.mul(1.05)
        if (hasMilestone(layer, 13)) mult = mult.mul("1e10")

        mult = mult.mul(player.ddrm.aEffect)
        mult = mult.mul(buyableEffect(layer, 13))

        if (player.ddrfc.points.gte(2)) mult = mult.mul(1.5)
        if (player.ddrfc.points.gte(3)) mult = mult.mul(1.25)
        if (player.ddrfc.points.gte(4)) mult = mult.mul(2.5)
        if (player.ddrfc.points.gte(8)) mult = mult.mul("1e6")

        layer = "bs"
        mult = mult.mul(buyableEffect(layer, 21))
        if (hasChallenge(layer, 21)) mult = mult.mul(new Decimal("1e33").pow(challengeCompletions(layer, 21)))

        layer = "d"
        if (hasUpgrade(layer, 31)) mult = mult.mul(10000)
        if (hasUpgrade(layer, 32)) mult = mult.mul(20000)
        if (hasUpgrade(layer, 33)) mult = mult.mul(40000)
        if (hasUpgrade(layer, 34)) mult = mult.mul(80000)
        //exp
        layer = "bs"
        if (hasUpgrade(layer, 22)) mult = mult.pow(1.15)
            
        if (inChallenge(layer, 12)) mult = mult.pow(0.05)
        //other hypers
        //time dilations/chals
        if (inChallenge("tvc", 11)) mult = mult.pow(player.tvc.basicFactor)
        if (inChallenge("tvc", 21)) mult = mult.pow(player.tvc.advancedFactor)
        if (inChallenge("tvc", 22)) mult = mult.pow(player.tvc.expertFactor)
        //final
        return mult
    }, //do everything inside the directMult()
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "S", description: "SHIFT+S: Reset for Songs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (player.n.points.gte("1e20")) player.s.unlocked = true
        return player.n.points.gte("1e20") || player.s.unlocked
    },
    resetsNothing() {return hasUpgrade("ddr", 43) && !player.s.resetting},
    autoPrestige() {return hasUpgrade("ddr", 44) || hasUpgrade("bs", 24)},
    resetDescription: "Compose ",
    canBuyMax() {return hasMilestone(this.layer, 1) || hasUpgrade("ddr", 12) || hasUpgrade("bs", 11)},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasUpgrade("ddr", 22)) keptUpgrades.push(11, 12, 13, 14, 21, 22, 23, 24)
        
        if (hasUpgrade("s", 31)) keptUpgrades.push(31)
        if (hasUpgrade("s", 32)) keptUpgrades.push(32)
        if (hasUpgrade("s", 33)) keptUpgrades.push(33)
        if (hasUpgrade("s", 34)) keptUpgrades.push(34)

        if (hasUpgrade("s", 41)) keptUpgrades.push(41)
        if (hasUpgrade("s", 42)) keptUpgrades.push(42)
        if (hasUpgrade("s", 43)) keptUpgrades.push(43)
        if (hasUpgrade("s", 44)) keptUpgrades.push(44)

        if (resettingLayer == "bs") keptUpgrades = []

        let keptMilestones = []
        if (hasUpgrade("ddr", 22)) keptMilestones.push(1, 2, 3, 4)
        if (hasChallenge("ddr", 22)) keptMilestones.push(5, 6, 7, 8, 9, 10)
            
        if (resettingLayer == "bs") keptMilestones = []
        if (hasMilestone("s", 11)) keptMilestones.push(11)
        if (hasMilestone("s", 12)) keptMilestones.push(12)
        if (hasMilestone("s", 13)) keptMilestones.push(13)
        if (hasMilestone("s", 14)) keptMilestones.push(14)
        if (hasMilestone("s", 15)) keptMilestones.push(15)

        let keptChallenges = []
        if (hasUpgrade("n", 303)) keptChallenges.push(11)
        if (hasChallenge("s", 12)) keptChallenges.push(12)

        if (resettingLayer == "bs") keptChallenges = []
        if (hasUpgrade("bs", 24)) keptChallenges.push(11, 12)

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasUpgrade("ddr", 23)) keep.push("total")

        let iR = player.s.resetting

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        player.s.resetting = iR
        player.s.upgrades.push(...keptUpgrades)
        player.s.milestones.push(...keptMilestones)
        keptChallenges.forEach(element => player[this.layer].challenges[element] = 1)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.n.points)} Notes.`}],
                "blank",
                ["display-text", function(){return `You have composed ${format(player.s.total)} Songs in total.`}],
                "blank",
                "upgrades",
                "blank",
                "clickables",
                "blank",
                "challenges",
            ]
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `You have ${format(player.n.points)} Notes.`}],
                "blank",
                ["display-text", function(){return `You have composed ${format(player.s.total)} Songs in total.`}],
                "blank",
                "milestones",
            ],
            unlocked() {return player.s.points.gte(3) || hasMilestone("s", 1)}
        },
    },

    upgrades: {
        11: {
            title: "Composition",
            effect() {
                let base = player.s.total.add(1).mul(5)
                base = base.pow(0.75).mul(25)
                if (hasUpgrade("n", 113)) base = base.mul(100).pow(1.5)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME"},
            description: "Total Songs composed boost ME.",
            cost: new Decimal("1"),
        },
        12: {
            title: "Rhythm Variation",
            description: "Unlock Half Notes (in Notes layer).",
            cost: new Decimal("2"),
        },
        13: {
            title: "Music Experience",
            effect() {
                let base = player.s.points.add(1)
                base = base.pow(1.25).mul(75)
                if (hasUpgrade(this.layer, 21)) base = base.pow(1.5)
                if (hasUpgrade("n", 113)) base = base.mul(50).pow(1.15)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME"},
            description: "Songs boost ME, and x15 HN.",
            cost: new Decimal("4"),
        },
        14: {
            title: "Automated Assistance (NOT AI 100%)",
            description: "Generate 100% of pending Notes per second, and +15 Notes.",
            cost: new Decimal("6"),
        },

        21: {
            title: "Repeated Assistance",
            description: "Unlock a Notes buyable and improve \"Music Experience\".",
            cost: new Decimal("8"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("bs", 14)}
        },
        22: {
            title: "Album Release",
            effect() {
                let base = player.s.points.add(1)
                base = new Decimal(1.5).pow(base)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " ME"},
            description: "Total Songs composed boost HN.",
            cost: new Decimal("12"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("bs", 14)}
        },
        23: {
            title: "Small but Powerful Boost",
            description: "x125 ME and Notes. Trust me!",
            cost: new Decimal("16"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("bs", 14)}
        },
        24: {
            title: "Purely Whole",
            description: "x1000 WN. And improve the 5th WN upgrade while I'm here.",
            cost: new Decimal("18"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("bs", 14)}
        },

        31: {
            title: "Minigame Boost",
            description: "x15 to DDR combo and Almost arrow gain, and Almost arrow's effect multiplies Arrows.",
            cost: new Decimal("210"),
            unlocked() {return hasUpgrade("ddr", 44) || hasUpgrade("bs", 14)}
        },
        32: {
            title: "Groovin'",
            description: "x1e10 to Groove Power gain.",
            cost: new Decimal("215"),
            unlocked() {return hasUpgrade("ddr", 44) || hasUpgrade("bs", 14)}
        },
        33: {
            title: "x1e21 (JST REFERENCE???)",
            description: "x1e21 to ME and Notes.",
            cost: new Decimal("228"),
            unlocked() {return hasUpgrade("ddr", 44) || hasUpgrade("bs", 14)}
        },
        34: {
            title: "Hardest of the Hardest",
            description: "Unlock \"CHALLENGE\".",
            cost: new Decimal("238"),
            unlocked() {return hasUpgrade("ddr", 44) || hasUpgrade("bs", 14)}
        },

        41: {
            title: "Mega Arrows",
            description: "x1e15 Arrows.",
            cost: new Decimal("1.75e9"),
            unlocked() {return hasMilestone("ddr", 12) || hasUpgrade("bs", 14)}
        },
        42: {
            title: "Mega Buyables",
            description: "You can bulk-buy the second Note buyable.",
            cost: new Decimal("1e13"),
            unlocked() {return hasMilestone("ddr", 12) || hasUpgrade("bs", 14)}
        },
        43: {
            title: "Mega Automation",
            description: "Automatically buy the DDR buyables.",
            cost: new Decimal("2e17"),
            unlocked() {return hasMilestone("ddr", 12) || hasUpgrade("bs", 14)}
        },
        44: {
            title: "Mega Unlock",
            description: "Unlock <b>Beat Saber.</b>",
            cost: new Decimal("1e20"),
            unlocked() {return hasMilestone("ddr", 12) || hasUpgrade("bs", 14)}
        },
    },

    milestones: {
        1: {
            requirementDescription: "1: 3 Songs",
            effectDescription: "You start to enjoy music a little more. x3 WN and x5 HN, and you can bulk-compose Songs.",
            done() { return player.s.points.gte(3) },
        },
        2: {
            requirementDescription: "2: 7 Songs",
            effectDescription: "You've created a playlist for your favorite tracks. Keep the first 12 Note upgrades on reset, and unlock another row of Note upgrades.",
            done() { return player.s.points.gte(7) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        3: {
            requirementDescription: "3: 14 Songs",
            effectDescription: "Adding more sounds into the songs. Keep the first 4 WN and HN upgrades on reset, and x500 Notes.",
            done() { return player.s.points.gte(14) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        4: {
            requirementDescription: "4: 17 Songs",
            effectDescription: "As many songs as Camellia's \"Chimera Dragons\"! Unlock 4 more WN upgrades, ^1.1 WN, and ^1.01 HN.",
            done() { return player.s.points.gte(17) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        5: {
            requirementDescription: "5: 22 Songs",
            effectDescription: "You seem to be more and more well-versed in music. +1 Songs and Note buyable 1's scaling is 125.",
            done() { return player.s.points.gte(22) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        6: {
            requirementDescription: "6: 44 Songs",
            effectDescription: "That's enough for 3 whole albums! \"Feel the Tempo\"'s softcap now starts at 1e50.",
            done() { return player.s.points.gte(44) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        7: {
            requirementDescription: "7: 50 Songs",
            effectDescription: "You feel the FLOW STATE of music production. Unlock \"Power Outage\".",
            done() { return player.s.points.gte(50) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        8: {
            requirementDescription: "8: 101 Songs",
            effectDescription: "After going to the local arcade, you have some newfound inspiration. x1e10 Notes.",
            done() { return player.s.points.gte(101) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        9: {
            requirementDescription: "9: 130 Songs",
            effectDescription: "You learned some very handy DAW shortcuts. Note buyable 1's effect now multiplies by 3.",
            done() { return player.s.points.gte(130) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        10: {
            requirementDescription: "10: 200 Songs",
            effectDescription: "The last Song milestone of the DDR layer! The layer as a whole has a lot of room to expand, though. ^1.1 Arrows and Almost arrow's effect now multiplies DDR combo gain.",
            done() { return player.s.points.gte(130) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        11: {
            requirementDescription: "11: 1e33 Songs",
            effectDescription: "OKAY I'M SORRY WHAT?!?!? Unlock a 5th row of Note upgrades.",
            done() { return player.s.points.gte("1e33") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        12: {
            requirementDescription: "12: 1e70 Songs",
            effectDescription: "If each atom in the universe was a unique song, we are <i>logarithmically</i> approaching the limit. Unlock the second row of EN upgrades.",
            done() { return player.s.points.gte("1e33") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        13: {
            requirementDescription: "13: 1e95 Songs",
            effectDescription: "Almost at a googol songs! x1,000,000 EN, and improve Movement's effects.",
            done() { return player.s.points.gte("1e95") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        14: {
            requirementDescription: "14: 1.23e123 Songs",
            effectDescription: "A placeholder milestone. Quarter Notes have a more drastic effect on Eighth Note generation.",
            done() { return player.s.points.gte("1.23e123") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        15: {
            requirementDescription: "15: 1e135 Songs",
            effectDescription: "I love Arrows. We should give them a x1e100 Boost after first softcap!",
            done() { return player.s.points.gte("1e135") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        16: {
            requirementDescription: "16: 1e500 Songs",
            effectDescription: "Toxic Violet Cubes is a Camellia song made for BSWC2021. It is track 4 in his album \"REX\". Therefore, x1e15 TVC.",
            done() { return player.s.points.gte("1e500") },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
    },

    clickables: {
        11: {
            title: "Does Composing reset? (Force DDR reset)",
            canClick() {return true},
            onClick() {
                doReset("ddr", true)
                player.s.resetting = !player.s.resetting
            },
            unlocked() {return hasUpgrade("ddr", 43)},
        },
    },

    challenges: {
        11: {
            name: "Power Outage",
            challengeDescription: "<i>\"Your laptop was running smoothly until the power cut off. Thankfully you have battery percentage, but it's <b>low.</b>\"</i> <br><br> ^0.5 to ME. The scaling of the first Note buyable is x1e10.",
            goalDescription: "Have 1e36 Notes.",
            rewardDescription: "Unlock Dance Dance Revolution.",
            canComplete: function() {return player.n.points.gte("1e36")},
            unlocked() {return hasMilestone("s", 7)},
            style() { return {
                "width": "400px",
                "height": "250px",
            } }
        },
        12: {
            name: "Week-Long Outage",
            challengeDescription: "<i>\"The laptop has inevitably died. Thankfully you made a save right before it died... but where do you get power?\"</i> <br><br> ^0.01 to ME and Notes. Songs HAVE to reset, and Stream and Voltage values must be maxed.",
            goalDescription: "Have 1,000 Notes.",
            rewardDescription: "x1e15 GP, ME, and Notes. +0.5 Songs.",
            canComplete: function() {return player.n.points.gte("1000") && player.s.resetting && player.ddr.voltage.log(1.2).div(-10).gte(1) && player.ddr.stream.log(player.ddr.streamImpact).div(10).gte(1)},
            unlocked() {return hasMilestone("ddr", 3)},
            style() { return {
                "width": "400px",
                "height": "250px",
            } }
        },
    },
    autoUpgrade() {return hasUpgrade("bs", 14)},

    branches: [["ddr", 1], ["ddrfc", 1]],
    tooltip() {
        if (canReset(this.layer)) return format(player.s.points) + " Songs (+" + format(getResetGain("s")) + " Songs on reset)"
        return format(player.s.points) + " Songs (Unable to reset)"
    },
})