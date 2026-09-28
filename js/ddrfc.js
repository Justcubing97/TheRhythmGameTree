addLayer("ddrfc", {
    name: "ddrfc", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        resetting: true,
    }},
    color: "#63b0e7",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( #dd389b, #63b0e7)";
		return style;
	},
    resource: "Full Combo Tiers", // Name of prestige currency
    baseResource: "Arrows", // Name of resource prestige is based on
    baseAmount() {return player.ddr.points}, // Get the current amount of baseResource
    requires() {return new Decimal("1e15")},
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 3, // Prestige currency exponent
    base: 100,
    directMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //do everything inside the directMult()
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "F", description: "SHIFT+F: Reset for Full Combo Tiers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("n", 314)) player.ddrfc.unlocked = true
        return player.ddrfc.unlocked
    },
    resetsNothing() {return hasUpgrade("bs", 34)},
    autoPrestige() {return hasUpgrade("bs", 34)},
    canBuyMax() {return false},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (resettingLayer == "tvc") keep.push("points")

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
                ["display-text", function(){return `You have ${format(player.ddr.points)} Arrows.`}],
                "blank",
                ["display-text", function(){return `You are currently at Full Combo Tier <h2 style="color: #63b0e7; text-shadow: 0px 0px 10px #63b0e7">${format(player.ddrfc.points)}</h2>, which provides...`}],
                "blank",
                ["display-text", function(){
                    let text = ""
                    if (player.ddrfc.points.gte(1)) text = "<h3>x1e25 ME</h3>"
                    if (player.ddrfc.points.gte(2)) text = "<h3>x1e50 ME<br>x1e10 Notes<br>x1.5 Songs</h3>"
                    if (player.ddrfc.points.gte(3)) text = "<h3>x1e75 ME<br>x1e20 Notes<br>x1.875 Songs<br>x25 M, G, and A arrows</h3>"
                    if (player.ddrfc.points.gte(4)) text = "<h3>x1e325 ME<br>x1e120 Notes<br>x4.6875 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain</h3>"
                    if (player.ddrfc.points.gte(5)) text = "<h3>x1e325 ME<br>x1e120 Notes<br>x4.6875 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain<br><br>QoL: bulk-buy the DDR buyables.</h3>"
                    if (player.ddrfc.points.gte(6)) text = "<h3>x1e325 ME<br>x1e120 Notes<br>x4.6875 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain<br><br>QoL: bulk-buy the DDR buyables.<br>QoL: passively generate 1% of the combo gained from Marvelous arrows.</h3>"
                    if (player.ddrfc.points.gte(7)) text = "<h3>x1e10,325 ME<br>x1e120 Notes<br>x4.6875 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain<br>x100,000 Arrows<br>x2.5 Cubes<br><br></h3>" +
                                                    "<h3>QoL: bulk-buy the DDR buyables.<br>QoL: passively generate 1% of the combo gained from Marvelous arrows.</h3>"
                    if (player.ddrfc.points.gte(8)) text = "<h3>x1e260,325 ME<br>x1e50,120 Notes<br>x4,687,500 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain<br>x1e20 Arrows<br>x25 Cubes<br>x50 BS combo gain<br><br></h3>" +
                                                    "<h3>QoL: bulk-buy the DDR buyables.<br>QoL: passively generate 1% of the combo gained from Marvelous arrows.</h3>"
                    if (player.ddrfc.points.gte(11)) text = "<h3>x1e260,325 ME<br>x1e50,120 Notes<br>x4,687,500 Songs<br>x25 M, G, and A arrows<br>x1e10 DDR combo gain<br>x1e20 Arrows<br>x25 Cubes<br>x50 BS combo gain<br>x15,000 max Stamina<br><br></h3>" +
                                                    "<h3>QoL: bulk-buy the DDR buyables.<br>QoL: passively generate 1% of the combo gained from Marvelous arrows.</h3>"
                    return text
                }],
                ["blank", "24px"],
                ["display-text", function(){return `Full Combo Tier <h2 style="color: #63b0e7; text-shadow: 0px 0px 10px #63b0e7">${format(player.ddrfc.points.add(1))}</h2> will provide an additional...`}],
                "blank",
                ["display-text", function(){
                    let text = "<h3>x1e25 ME</h3>"
                    if (player.ddrfc.points.gte(1)) text = "<h3>x1e25 ME<br>1e10 Notes<br>x1.5 Songs</h3>"
                    if (player.ddrfc.points.gte(2)) text = "<h3>x1e25 ME<br>x1e10 Notes<br>x1.25 Songs<br>x25 M, G, and A arrows</h3>"
                    if (player.ddrfc.points.gte(3)) text = "<h3>x1e250 ME<br>x1e100 Notes<br>x2.5 Songs<br>x1e10 DDR combo gain</h3>"
                    if (player.ddrfc.points.gte(4)) text = "<h3>QoL: bulk-buy the DDR buyables.</h3>"
                    if (player.ddrfc.points.gte(5)) text = "<h3>QoL: passively generate 1% of the combo gained from Marvelous arrows.</h3>"
                    if (player.ddrfc.points.gte(6)) text = "<h3>x1e10,000 ME (after third softcap)<br>x100,000 Arrows (after first softcap)<br>x2.5 Cubes</h3>"
                    if (player.ddrfc.points.gte(7)) text = "<h3>x1e250,000 ME (after third softcap)<br>x1e50,000 Notes (after second softcap)<br>x1,000,000 Songs<br>x1e15 Arrows (after first softcap)<br>x10 Cubes<br>x50 BS combo gain</h3>"
                    if (player.ddrfc.points.gte(8)) text = "<h3>Nothing!</h3>"
                    if (player.ddrfc.points.gte(10)) text = "<h3>x15,000 max Stamina</h3>"
                    if (player.ddrfc.points.gte(11)) text = "<h3>Nothing!</h3>"
                    return text
                }],
            ]
        },
    },

    branches: [["bs", 1], ["d", 1], ["tvc", 1]],
    tooltip() {
        if (canReset(this.layer)) return format(player.ddrfc.points) + " Full Combo Tiers (+" + format(getResetGain("ddrfc")) + " Full Combo Tiers on reset)"
        return format(player.ddrfc.points) + " Full Combo Tiers (Unable to reset)"
    },
})