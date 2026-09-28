let modInfo = {
	name: "The Rhythm Game Tree",
	author: "Justcubing97",
	pointsName: "Musical Essence",
	modFiles: ["a.js", "notes.js", "songs.js", "ddr.js", "ddrfc.js", "bs.js", "d.js", "tvc.js", "tree.js", "ddrm.js", "bsm.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "3.2.1",
	name: "DDR layer fix",
}

let changelog = `<h1>Changelog:</h1><br>
	<h2>v3.2.1</h2><br>
        - Fixed a bug with the DDR buyables instantly giving 1e2750 ME at the start of the game. <br><br>
	<h2>v3.2</h2><br>
		- Some new content! <br>
        - More achievements. <br>
        - More campaign things! <br><br>
	<h2>v3.1</h2><br>
		- A LOT of new content! <br>
        - Beat Saber Campaign implemented. <br>
        - More achievements. <br>
        - Distance layer! <br>
        - Beat Saber Minigame! <br><br>
	<h2>v3.0</h2><br>
		- Finished off the DDR layer! <br>
        - BEAT SABER LAYER INTRO! <br><br>
	<h2>v2.3</h2><br>
		- Properly credited Camellia. My bad! <br>
        - TONS of new content! <br><br>
	<h2>v2.2</h2><br>
		- Implemented a combo feature in the DDR minigame. <br>
        - More DDR content! <br>
        - Music! 22 hand-picked tracks made by Camellia and I - fits the rhythm game theme. <br>
        - More achievements. <br><br>
	<h2>v2.1</h2><br>
		- Added effects from the DDR minigame. <br>
        - Fixed Note layer progression - no more timewall at 1e10 Notes! <br>
        - More Arrow upgrades. <br><br>
	<h2>v2.0</h2><br>
		- Fixed CSS for upgrades. <br>
        - New DDR minigame! <br>
        - Implemented one Arrow upgrade. <br><br>
	<h3>v1.1</h3><br>
		- Fixed CSS for elements. <br><br>
	<h2>v1.0</h2><br>
		- Three layers: Notes, Songs, and DDR! <br>
		- 7 Achievements.`

let winText = `Congratulations! You have reached the end and beaten this game as of ${VERSION.num}! If the version number is below 7, there's still more content!`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything",
    "arrowClicking_DDRM",
    "findMults_DDRM",
    
    "findColors_BSM",
    "findDirections_BSM",
    "findClicks_BSM",
    "findMults_BSM",
    "findMults_DIST"
]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

    let layer;
	let mult = new Decimal(1)
    //add
    layer = "n"
    if (hasUpgrade(layer, 23)) mult = mult.add(6)
    if (hasUpgrade(layer, 101)) mult = mult.add(3)
    if (hasUpgrade(layer, 103)) mult = mult.add(10)
    //mul
    if (hasAchievement("a", 26)) mult = mult.mul("1e100")

    layer = "n"
    if (hasUpgrade(layer, 11)) mult = mult.mul(3)
    if (hasUpgrade(layer, 12)) mult = mult.mul(upgradeEffect(layer, 12))
    if (hasUpgrade(layer, 14)) mult = mult.mul(4)
    if (hasUpgrade(layer, 21)) mult = mult.mul(6)
    if (hasUpgrade(layer, 34)) mult = mult.mul(4)
    if (hasUpgrade(layer, 102)) mult = mult.mul(upgradeEffect(layer, 102))
    if (hasUpgrade(layer, 202)) mult = mult.mul(500)
    if (hasUpgrade(layer, 42)) mult = mult.mul(1000)
    if (hasUpgrade(layer, 43)) mult = mult.mul(upgradeEffect(layer, 43))
    if (hasUpgrade(layer, 44)) mult = mult.mul(2500)
    if (hasUpgrade(layer, 112)) mult = mult.mul("2e4")
    if (hasUpgrade(layer, 302)) mult = mult.mul(upgradeEffect(layer, 302))

    layer = "s"
    if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
    if (hasUpgrade(layer, 13)) mult = mult.mul(upgradeEffect(layer, 13))
    if (hasUpgrade(layer, 23)) mult = mult.mul(125)
    if (hasUpgrade(layer, 33)) mult = mult.mul("1e21")
    if (hasChallenge(layer, 12)) mult = mult.mul("1e15")

    layer = "ddr"
    if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
    if (hasUpgrade(layer, 13)) mult = mult.mul("1e6")
    if (hasChallenge(layer, 11)) mult = mult.mul("1e10")
    if (hasUpgrade(layer, 23)) mult = mult.mul("1e15")
    if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)
    if (hasUpgrade(layer, 43)) mult = mult.mul("1e20")
        
    mult = mult.mul(player.ddrm.mEffect)
    mult = mult.mul(buyableEffect(layer, 21))

    if (player.ddrfc.points.gte(1)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(2)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(3)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(4)) mult = mult.mul("1e250")

    layer = "bs"
    if (hasUpgrade(layer, 11)) mult = mult.mul("1e1000")

    mult = mult.mul(buyableEffect(layer, 22))

    mult = mult.mul(player.bsm.badEffect)
    //exp
    layer = "n"
    if (hasUpgrade(layer, 201)) mult = mult.pow(1.05)
    if (hasUpgrade(layer, 304)) mult = mult.pow(1.15)

    layer = "ddr"
    if (hasMilestone(layer, 2)) mult = mult.pow(1.1)

    layer = "bs"
    if (hasUpgrade(layer, 22)) mult = mult.pow(1.15)
    //hyper
    layer = "n"
    //time dilations/chals
    layer = "n"
    layer = "s"
    if (inChallenge(layer, 11)) mult = mult.pow(0.5)
    if (inChallenge(layer, 12)) mult = mult.pow(0.01)

    layer = "ddr"
    if (inChallenge(layer, 11)) mult = mult.pow(0.75)
    if (inChallenge(layer, 22)) mult = mult.pow(0.1)
    mult = mult.pow(player.ddr.voltage)

    layer = "bs"
    if (inChallenge(layer, 11)) mult = mult.pow(0.001)
    //=====
    //softcap stuff
    let softcap1 = new Decimal(0.25)
    softcap1 = softcap1.add(buyableEffect("bs", 81))
    softcap1 = softcap1.div(player.ddr.air)

    let softcap1Start = new Decimal("1e2000")
    if (mult.gte(softcap1Start)) mult = mult.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap1)))

    let softcap2 = new Decimal(0.2)
    softcap2 = softcap2.add(buyableEffect("bs", 81))
    softcap2 = softcap2.div(player.ddr.air)
    
    let softcap2Start = new Decimal("1e500000")
    if (mult.gte(softcap2Start)) mult = mult.pow(softcap2).mul(new Decimal(softcap2Start).pow(decimalOne.sub(softcap2)))

    let softcap3 = new Decimal(0.15)
    softcap3 = softcap3.add(buyableEffect("bs", 81))
    softcap3 = softcap3.div(player.ddr.air)

    let softcap3Start = new Decimal("e1e6")
    if (mult.gte(softcap3Start)) mult = mult.pow(softcap3).mul(new Decimal(softcap3Start).pow(decimalOne.sub(softcap3)))
        
    if (player.ddrfc.points.gte(7)) mult = mult.mul("1e10000")
    if (player.ddrfc.points.gte(8)) mult = mult.mul("1e250000")
        
    if (hasUpgrade("d", 61)) mult = mult.mul(upgradeEffect("d", 61))
    if (hasUpgrade("d", 62)) mult = mult.mul(upgradeEffect("d", 62))
    if (hasUpgrade("d", 63)) mult = mult.mul(upgradeEffect("d", 63))
    if (hasUpgrade("d", 64)) mult = mult.mul(upgradeEffect("d", 64))
        
    if (hasUpgrade("n", 413)) mult = mult.pow(1.25)

    if (inChallenge("tvc", 11)) mult = mult.pow(player.tvc.basicFactor)

    //NOT ME GAIN RELATED STUFF AHEAD!
    //mecombonerf for ddr challenges
    if (inChallenge("ddr", 11)) player.MEComboNerf = player.points.add(2).log(10).div(350)
    if (inChallenge("ddr", 12)) player.MEComboNerf = player.points.add(2).log(25).div(500)
    if (inChallenge("ddr", 21)) player.MEComboNerf = new Decimal(0.98).pow(player.ddrm.combo)
    if (inChallenge("ddr", 22)) player.MEComboNerf = player.points.add(2).log(100).div(1000)

	return mult
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
    MEComboNerf: new Decimal(1),
}}

// Display extra things at the top of the page
var displayThings = [
    "Current endgame: 5/5 the EASY Beat Saber difficulty.",
    "The Rhythm Game Tree made by Justcubing97",
    function() {
		if (inChallenge("ddr", 11) ||
        inChallenge("ddr", 12) ||
        inChallenge("ddr", 22)) return `<br><b>Musical Essence is multiplying combo gain by x${format(player.MEComboNerf, 4)}!</b>`
		if (inChallenge("ddr", 21)) return `<br><b>Combo is multiplying combo gain by x${format(player.MEComboNerf, 4)}!</b>`
		else return ""
	},
    function() {if (player.points.gte("1e2000")) return "<b>FIRST SOFTCAP: 1e2000</b>"},
    function() {if (player.points.gte("1e500000")) return "<b>SECOND SOFTCAP: 1e500000</b>"},
    function() {if (player.points.gte("e1e6")) return "<b>THIRD SOFTCAP: e1000000</b>"},
]

// Determines when the game "ends"
function isEndgame() {
	return challengeCompletions("bs", 11) >= 5
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

/*

addLayer("LAYERHERE", {
    name: "LAYERHERE", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SYMBOLHERE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: POSITIONHERE, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"), //defaults for normal layers
    }},
    color: "COLORHERE",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( SECCOLORHERE, PRIMCOLORHERE)";
		return style;
	},
    requires: new Decimal(NUMBERHERE), // Can be a function that takes requirement increases into account
    resource: "CURRENCYHERE", // Name of prestige currency
    baseResource: "CURRENCYHERE", // Name of resource prestige is based on
    baseAmount() {return player.LAYERHERE.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: NUMBERHERE, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //primary multi
    getResetGain() {
        let layer = "LAYERHERE"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (gain.gte(player[layer].softcap1Start)) gain = gain.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
        //put after first softcap things after this line
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: ROWHERE, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [ //use shift for currencies, regulars for minigames
        {key: "KEYHERE", description: "KEYDESCHERE: Reset for CURRENCYHERE", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (BOOLHERE) player.LAYERHERE.unlocked = true
        return player.LAYERHERE.unlocked
    },
    passiveGeneration() {BOOLHERE}, //use autoPrestige() if static!
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
    upgrades: {
        11: {
            title: "placeholder",
            description: "???",
            cost: new Decimal("1e234987234987234"),
        },
    },
    tooltip() {return format(player.LAYERHERE.points) + " CURRENCYHERE (+" + format(getResetGain("LAYERHERE")) + " CURRENCYHERE on reset)"},
})

*/