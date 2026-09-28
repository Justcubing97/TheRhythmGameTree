addLayer("bsm", {
    startData() { return {
        unlocked: false,
        points: new Decimal(0),

        cutEffect: new Decimal(1),
        bad: new Decimal(0),
        badEffect: new Decimal(1),

        combo: new Decimal(0),
        highestCombo: new Decimal(0),
        cEffect: new Decimal(0),    

        current: [],
        displayBlue: [],
        displayRed: [],
        displayWhite: [],
        paused: false,
        timer: 0,
        
        softcap1: new Decimal(0.1),
        softcap1Start: new Decimal("1e10000"), //defaults for normal layers
    }},
	color: "#0000E0",
    symbol: "⏹️",

    resource: "Cuts", 
    row: "side",
    position: 2,
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Beat Saber Minigame")
    },

    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;
        if (layers[resettingLayer].row <= 3) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER

    findMults_BSM(type, arg){
        let mult = new Decimal(1)
        if (type == "c"){
            mult = mult.mul(player.bsm.cEffect)
            if (hasUpgrade("bs", 33)) mult = mult.mul(15)
            if (hasUpgrade("d", 21)) mult = mult.mul(100)
            if (hasUpgrade("d", 22)) mult = mult.mul(125)
            if (hasUpgrade("d", 23)) mult = mult.mul(175)
            if (hasUpgrade("d", 24)) mult = mult.mul(250)
            mult = mult.mul(buyableEffect("bs", 91))

            return mult
        }

        mult = new Decimal(1)
        if (type == "b"){
            mult = mult.mul(player.bsm.cEffect)
            if (hasUpgrade("bs", 33)) mult = mult.mul(15)
            mult = mult.mul(buyableEffect("bs", 42))
            mult = mult.mul(new Decimal(15).pow(challengeCompletions(layer, 11)))
            
            if (hasUpgrade("ddr", 51)) mult = mult.pow(upgradeEffect("ddr", 51))
            mult = mult.mul(buyableEffect("bs", 91))

            return mult
        }

        mult = new Decimal(1)
        if (type == "o"){
            if (hasUpgrade("n", 53)) mult = mult.mul(3)
            if (hasUpgrade("bs", 33)) mult = mult.mul(15)
            if (hasUpgrade("d", 21)) mult = mult.mul(3)
            if (hasUpgrade("d", 22)) mult = mult.mul(4)
            if (hasUpgrade("d", 23)) mult = mult.mul(5)
            if (hasUpgrade("d", 24)) mult = mult.mul(6)
            mult = mult.mul(buyableEffect("bs", 41))
            if (hasUpgrade("bs", 41)) mult = mult.mul(upgradeEffect("bs", 41))
            if (player.ddrfc.points.gte(8)) mult = mult.mul(50)
            if (hasUpgrade("ddr", 52)) mult = mult.mul(player.ddrm.aEffect)

            if (hasUpgrade("ddr", 51)) mult = mult.pow(upgradeEffect("ddr", 51))
            if (hasUpgrade("d", 74)) mult = mult.pow(1.25)
            mult = mult.mul(buyableEffect("bs", 91))
            mult = mult.mul(new Decimal(250).pow(challengeCompletions("bs", 12)))
            
            if (arg == "c"){
                return mult
            }

            if (arg == "b"){
                return mult
            }
        }
    },

    findClicks_BSM(dir){
        let block = player.bsm.current[0]
        if (!block) return;
        if (block[2] <= 3) return;
        
        for (let clickC = 1; clickC <= 9; clickC++){
            if (block[0] == clickC && block[1] == 1){ //side 1 focus
                if (block[0] == 5) {
                    if (dir == 5){
                        player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c").mul(5))
                        player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c").mul(5))
                    } else if (dir == 14){
                        player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b").mul(5))
                    } else {
                        player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c"))
                        player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c"))
                    }
                } else if (dir == clickC) {
                    player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c"))
                    player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c"))
                } else if (dir <= 9){
                    player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b"))
                } else if (dir == clickC + 9){
                    player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b"))
                }
                player.bsm.current.shift()
                break;
            }

            if (block[0] == clickC && block[1] == 2){ //side 2 focus
                if (block[0] == 5) {
                    if (dir == 14){
                        player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c").mul(5))
                        player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c").mul(5))
                    } else if (dir == 5){
                        player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b").mul(5))
                    } else {
                        player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c"))
                        player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c"))
                    }
                } else if (dir == clickC + 9) {
                    player.bsm.points = player.bsm.points.add(tmp.bsm.findMults_BSM("c", "c"))
                    player.bsm.combo = player.bsm.combo.add(tmp.bsm.findMults_BSM("o", "c"))
                } else if (dir <= 18 && dir >= 10){
                    player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b"))
                } else if (dir == clickC){
                    player.bsm.bad = player.bsm.bad.add(tmp.bsm.findMults_BSM("b", "b"))
                }
                player.bsm.current.shift()
                break;
            }
        }
    },

    findDirections_BSM(){
        let colorWhite = []
        player.bsm.displayWhite = []

        //  1  2  3
        //
        //  4  5  6
        //
        //  7  8  9

        if (player.bsm.current[0]){
            if (player.bsm.current[0][0] == 1){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [505, 506, 605]
                if (player.bsm.current[0][2] == 4) colorWhite = [404, 405, 406, 504, 505, 604]
                if (player.bsm.current[0][2] == 5) colorWhite = [303, 304, 305, 306, 403, 404, 405, 503, 504, 603]
            }

            if (player.bsm.current[0][0] == 2){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [506, 605, 606, 607]
                if (player.bsm.current[0][2] == 4) colorWhite = [406, 505, 506, 507, 604, 605, 606, 607, 608]
                if (player.bsm.current[0][2] == 5) colorWhite = [306, 405, 406, 407, 504, 505, 506, 507, 508, 603, 604, 605, 606, 607, 608, 609]
            }
            if (player.bsm.current[0][0] == 3){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [506, 507, 607]
                if (player.bsm.current[0][2] == 4) colorWhite = [406, 407, 408, 507, 508, 608]
                if (player.bsm.current[0][2] == 5) colorWhite = [306, 307, 308, 309, 407, 408, 409, 508, 509, 609]
            }

            if (player.bsm.current[0][0] == 4){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [506, 605, 606, 706]
                if (player.bsm.current[0][2] == 4) colorWhite = [604, 505, 605, 705, 406, 506, 606, 706, 806]
                if (player.bsm.current[0][2] == 5) colorWhite = [603, 504, 604, 704, 405, 505, 605, 705, 805, 306, 406, 506, 606, 706, 806, 906]
            }

            if (player.bsm.current[0][0] == 5){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [606]
                if (player.bsm.current[0][2] == 4) colorWhite = [505, 506, 507, 605, 606, 607, 705, 706, 707]
                if (player.bsm.current[0][2] == 5) colorWhite = [505, 506, 507, 605, 606, 607, 705, 706, 707]
            }

            if (player.bsm.current[0][0] == 6){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [506, 607, 606, 706]
                if (player.bsm.current[0][2] == 4) colorWhite = [608, 507, 607, 707, 406, 506, 606, 706, 806]
                if (player.bsm.current[0][2] == 5) colorWhite = [609, 508, 608, 708, 407, 507, 607, 707, 807, 306, 406, 506, 606, 706, 806, 906]
            }

            if (player.bsm.current[0][0] == 7){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [705, 706, 605]
                if (player.bsm.current[0][2] == 4) colorWhite = [804, 805, 806, 704, 705, 604]
                if (player.bsm.current[0][2] == 5) colorWhite = [903, 904, 905, 906, 803, 804, 805, 703, 704, 603]
            }

            if (player.bsm.current[0][0] == 8){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [706, 605, 606, 607]
                if (player.bsm.current[0][2] == 4) colorWhite = [806, 705, 706, 707, 604, 605, 606, 607, 608]
                if (player.bsm.current[0][2] == 5) colorWhite = [906, 805, 806, 807, 704, 705, 706, 707, 708, 603, 604, 605, 606, 607, 608, 609]
            }

            if (player.bsm.current[0][0] == 9){
                if (player.bsm.current[0][2] == 2) colorWhite = [606]
                if (player.bsm.current[0][2] == 3) colorWhite = [707, 706, 607]
                if (player.bsm.current[0][2] == 4) colorWhite = [808, 807, 806, 708, 707, 608]
                if (player.bsm.current[0][2] == 5) colorWhite = [909, 908, 907, 906, 809, 808, 807, 708, 709, 609]
            }

            if (player.bsm.current[0][1] == 2){
                for (let qwerqwer = 0; qwerqwer < colorWhite.length; qwerqwer++) colorWhite[qwerqwer] = colorWhite[qwerqwer] + 13
            }
        }

        if (player.bsm.current[1]){
            if (player.bsm.current[1][0] == 1){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [505, 506, 605]
                if (player.bsm.current[1][2] == 4) colorWhite = [404, 405, 406, 504, 505, 604]
                if (player.bsm.current[1][2] == 5) colorWhite = [303, 304, 305, 306, 403, 404, 405, 503, 504, 603]
            }

            if (player.bsm.current[1][0] == 2){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [506, 605, 606, 607]
                if (player.bsm.current[1][2] == 4) colorWhite = [406, 505, 506, 507, 604, 605, 606, 607, 608]
                if (player.bsm.current[1][2] == 5) colorWhite = [306, 405, 406, 407, 504, 505, 506, 507, 508, 603, 604, 605, 606, 607, 608, 609]
            }
            if (player.bsm.current[1][0] == 3){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [506, 507, 607]
                if (player.bsm.current[1][2] == 4) colorWhite = [406, 407, 408, 507, 508, 608]
                if (player.bsm.current[1][2] == 5) colorWhite = [306, 307, 308, 309, 407, 408, 409, 508, 509, 609]
            }

            if (player.bsm.current[1][0] == 4){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [506, 605, 606, 706]
                if (player.bsm.current[1][2] == 4) colorWhite = [604, 505, 605, 705, 406, 506, 606, 706, 806]
                if (player.bsm.current[1][2] == 5) colorWhite = [603, 504, 604, 704, 405, 505, 605, 705, 805, 306, 406, 506, 606, 706, 806, 906]
            }

            if (player.bsm.current[1][0] == 5){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [606]
                if (player.bsm.current[1][2] == 4) colorWhite = [505, 506, 507, 605, 606, 607, 705, 706, 707]
                if (player.bsm.current[1][2] == 5) colorWhite = [505, 506, 507, 605, 606, 607, 705, 706, 707]
            }

            if (player.bsm.current[1][0] == 6){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [506, 607, 606, 706]
                if (player.bsm.current[1][2] == 4) colorWhite = [608, 507, 607, 707, 406, 506, 606, 706, 806]
                if (player.bsm.current[1][2] == 5) colorWhite = [609, 508, 608, 708, 407, 507, 607, 707, 807, 306, 406, 506, 606, 706, 806, 906]
            }

            if (player.bsm.current[1][0] == 7){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [705, 706, 605]
                if (player.bsm.current[1][2] == 4) colorWhite = [804, 805, 806, 704, 705, 604]
                if (player.bsm.current[1][2] == 5) colorWhite = [903, 904, 905, 906, 803, 804, 805, 703, 704, 603]
            }

            if (player.bsm.current[1][0] == 8){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [706, 605, 606, 607]
                if (player.bsm.current[1][2] == 4) colorWhite = [806, 705, 706, 707, 604, 605, 606, 607, 608]
                if (player.bsm.current[1][2] == 5) colorWhite = [906, 805, 806, 807, 704, 705, 706, 707, 708, 603, 604, 605, 606, 607, 608, 609]
            }

            if (player.bsm.current[1][0] == 9){
                if (player.bsm.current[1][2] == 2) colorWhite = [606]
                if (player.bsm.current[1][2] == 3) colorWhite = [707, 706, 607]
                if (player.bsm.current[1][2] == 4) colorWhite = [808, 807, 806, 708, 707, 608]
                if (player.bsm.current[1][2] == 5) colorWhite = [909, 908, 907, 906, 809, 808, 807, 708, 709, 609]
            }

            if (player.bsm.current[1][1] == 2){
                for (let qwerqwer = 0; qwerqwer < colorWhite.length; qwerqwer++) colorWhite[qwerqwer] = colorWhite[qwerqwer] + 13
            }
        }

        player.bsm.displayWhite = colorWhite
    },

    findColors_BSM(){
        let colorRed = []
        let colorBlue = []
        player.bsm.displayRed = []
        player.bsm.displayBlue = []

        if (player.bsm.current[1] && player.bsm.current[1][1] == 1){

            if (player.bsm.current[1][2] >= 1) colorRed.push(606)
            if (player.bsm.current[1][2] >= 2) colorRed.push(505, 506, 507, 605, 607, 705, 706, 707)
            if (player.bsm.current[1][2] >= 3) colorRed.push(404, 405, 406, 407, 408, 504, 508, 604, 608, 704, 708, 804, 805, 806, 807, 808)
            if (player.bsm.current[1][2] >= 4) colorRed.push(303, 304, 305, 306, 307, 308, 309, 403, 503, 603, 703, 803, 409, 509, 609, 709, 809, 903, 904, 905, 906, 907, 908, 909)
            if (player.bsm.current[1][2] >= 5) colorRed.push(202, 203, 204, 205, 206, 207, 208, 209, 210, 302, 310, 402, 410, 502, 510, 602, 610, 702, 710, 802, 810, 902, 910, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010)

            player.bsm.displayRed = colorRed
        }

        if (player.bsm.current[1] && player.bsm.current[1][1] == 2){

            if (player.bsm.current[1][2] >= 1) colorBlue.push(619)
            if (player.bsm.current[1][2] >= 2) colorBlue.push(518, 519, 520, 618, 620, 718, 719, 720)
            if (player.bsm.current[1][2] >= 3) colorBlue.push(417, 418, 419, 420, 421, 517, 521, 617, 621, 717, 721, 817, 818, 819, 820, 821)
            if (player.bsm.current[1][2] >= 4) colorBlue.push(316, 317, 318, 319, 320, 321, 322, 416, 516, 616, 716, 816, 422, 522, 622, 722, 822, 916, 917, 918, 919, 920, 921, 922)
            if (player.bsm.current[1][2] >= 5) colorBlue.push(215, 216, 217, 218, 219, 220, 221, 222, 223, 315, 415, 515, 615, 715, 815, 915, 323, 423, 523, 623, 723, 823, 923, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023)

            player.bsm.displayBlue = colorBlue
        }

        if (player.bsm.current[0] && player.bsm.current[0][1] == 1){

            if (player.bsm.current[0][2] >= 1) colorRed.push(606)
            if (player.bsm.current[0][2] >= 2) colorRed.push(505, 506, 507, 605, 607, 705, 706, 707)
            if (player.bsm.current[0][2] >= 3) colorRed.push(404, 405, 406, 407, 408, 504, 508, 604, 608, 704, 708, 804, 805, 806, 807, 808)
            if (player.bsm.current[0][2] >= 4) colorRed.push(303, 304, 305, 306, 307, 308, 309, 403, 503, 603, 703, 803, 409, 509, 609, 709, 809, 903, 904, 905, 906, 907, 908, 909)
            if (player.bsm.current[0][2] >= 5) colorRed.push(202, 203, 204, 205, 206, 207, 208, 209, 210, 302, 310, 402, 410, 502, 510, 602, 610, 702, 710, 802, 810, 902, 910, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010)

            player.bsm.displayRed = colorRed
        }

        if (player.bsm.current[0] && player.bsm.current[0][1] == 2){

            if (player.bsm.current[0][2] >= 1) colorBlue.push(619)
            if (player.bsm.current[0][2] >= 2) colorBlue.push(518, 519, 520, 618, 620, 718, 719, 720)
            if (player.bsm.current[0][2] >= 3) colorBlue.push(417, 418, 419, 420, 421, 517, 521, 617, 621, 717, 721, 817, 818, 819, 820, 821)
            if (player.bsm.current[0][2] >= 4) colorBlue.push(316, 317, 318, 319, 320, 321, 322, 416, 516, 616, 716, 816, 422, 522, 622, 722, 822, 916, 917, 918, 919, 920, 921, 922)
            if (player.bsm.current[0][2] >= 5) colorBlue.push(215, 216, 217, 218, 219, 220, 221, 222, 223, 315, 415, 515, 615, 715, 815, 915, 323, 423, 523, 623, 723, 823, 923, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023)

            player.bsm.displayBlue = colorBlue
        }
    },

    grid: {
        rows: 11, // If these are dynamic make sure to have a max value as well!
        cols: 24,
        getStartData(id) {
            return 0
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return false
        },
        onClick(data, id) { 
        },
        getDisplay(data, id){
            return ""
        },
        getStyle(data, id){
            //origins: 606, 619
            if (player.bsm.displayWhite.includes(id)){
                return {
                    "background": "#ffffff",
                    "transform": `rotate(0deg)`,
                    "width": "30px",
                    "height": "30px",
                }
            }

            if (player.bsm.displayBlue.includes(id)){
                return {
                    "background": "#40a0ff",
                    "transform": `rotate(0deg)`,
                    "width": "30px",
                    "height": "30px",
                }
            }

            if (player.bsm.displayRed.includes(id)){
                return {
                    "background": "#ff4040",
                    "transform": `rotate(0deg)`,
                    "width": "30px",
                    "height": "30px",
                }
            }

            return {
                "background": "#0b3f74",
                "transform": `rotate(0deg)`,
                "width": "30px",
                "height": "30px",
            }
        }
    },

    clickables: {
        11: {
            title: "↖",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(1)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        12: {
            title: "↑",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(2)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        13: {
            title: "↗",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(3)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        21: {
            title: "←",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(4)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        22: {
            title: "•",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(5)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        23: {
            title: "→",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(6)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        31: {
            title: "↙",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(7)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        32: {
            title: "↓",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(8)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },
        33: {
            title: "↘",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(9)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                    "background-color": "#E00000",
                }
            }
        },

        41: {
            title: "↖",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(10)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        42: {
            title: "↑",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(11)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        43: {
            title: "↗",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(12)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        51: {
            title: "←",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(13)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        52: {
            title: "•",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(14)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        53: {
            title: "→",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(15)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        61: {
            title: "↙",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(16)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        62: {
            title: "↓",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(17)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
        63: {
            title: "↘",
            canClick() {return true},
            onClick() {
                tmp.bsm.findClicks_BSM(18)
            },
            style() {
                return {
                    "font-size": "40px",
                    "width": "120px",
                    "height": "120px",
                }
            }
        },
    },

    update(diff){
        tmp.bsm.findColors_BSM()
        tmp.bsm.findDirections_BSM()
        player.bsm.timer += 1
        player.bsm.timer = Math.floor(player.bsm.timer % 16)

        for (let BSMC = 0; BSMC < player.bsm.current.length; BSMC++){ //this loop moves the notes
            let deleteThreshold = 5
            if (player.bsm.timer % 8 <= 0.01){ //every few
                player.bsm.current[BSMC] = [
                    player.bsm.current[BSMC][0],
                    player.bsm.current[BSMC][1],
                    player.bsm.current[BSMC][2] + 1 //shift the note in the array
                ]
                if (player.bsm.current[BSMC][2] > deleteThreshold){ //is it out of the play area?
                    player.bsm.current.shift() //delete it!
                    player.bsm.combo = new Decimal(0) //bye bye
                }
            }
        }

        if (player.bsm.timer == 0){ //this conditional spawns the notes
            let dir = Math.floor(Math.random() * 9) + 1 //chooses direction
            let col = Math.floor(Math.random() * 2) + 1 //initializes color
            if (player.bsm.current.length < 1) player.bsm.current.push([dir, col, 1]) //pushes the chosen color and column to the array
            //if (player.bsm.current.length < 1) player.bsm.current.push([5, 1, 1]) //CONTROLLED SPAWNING ONLY
        }

        //combo
        player.bsm.highestCombo = Decimal.max(player.bsm.highestCombo, player.bsm.combo)

        //effects
        if (inChallenge("bs", 12)){
            player.bsm.cutEffect = new Decimal(1)
            player.bsm.badEffect = new Decimal(1)
            player.bsm.cEffect = new Decimal(1)
        } else {
            let mult = new Decimal(1)
            mult = player.bsm.points.add(1).log(2).add(1).pow(2.5)
            if (hasUpgrade("bs", 31)) mult = mult.mul(15)
            if (hasUpgrade("d", 41)) mult = mult.pow(1.25)
            if (hasUpgrade("d", 42)) mult = mult.pow(1.5)
            if (hasUpgrade("d", 43)) mult = mult.pow(1.75)
            if (hasUpgrade("d", 44)) mult = mult.pow(2)

            player.bsm.cutEffect = mult
            //=====
            mult = player.bsm.bad.add(1).pow(100)
            if (hasUpgrade("bs", 31)) mult = mult.pow(1.5)
            if (hasUpgrade("d", 41)) mult = mult.pow(1.25)
            if (hasUpgrade("d", 42)) mult = mult.pow(1.5)
            if (hasUpgrade("d", 43)) mult = mult.pow(1.75)
            if (hasUpgrade("d", 44)) mult = mult.pow(2)
            if (hasUpgrade("ddr", 54)) mult = mult.pow(25)

            player.bsm.badEffect = mult
            //=====
            mult = player.bsm.highestCombo.add(1).pow(0.25)
            if (hasUpgrade("ddr", 54)) mult = mult.pow(1.5)

            player.bsm.cEffect = mult
        }
    },

    tabFormat: [
        ["infobox", "minigame"],
        "blank",
        ["display-text", function(){if (player.bsm.points.gte(player.bsm.softcap1Start)) return `<b>FIRST SOFTCAP - 1e10,000</b>`; else return ""}],
        ["display-text", function(){return `You have cut <h2 style="color: #40a0ff; text-shadow: 0px 0px 10px #40a0ff">${format(player.bsm.points, 4)}</h2> cubes (Cuts), multiplying Arrows by x${format(player.bsm.cutEffect, 4)}`}],
        ["display-text", function(){return `You have badly cut <h2 style="color: #ff4040; text-shadow: 0px 0px 10px #ff4040">${format(player.bsm.bad, 4)}</h2> cubes (Bad Cuts), multiplying ME by x${format(player.bsm.badEffect, 4)}`}],
        ["blank", "8px"],
        ["display-text", function(){return `Your highest combo is <h2 style="color: #0080FF; text-shadow: 0px 0px 10px #0080FF">${format(player.bsm.highestCombo, 4)}</h2> cuts, multiplying Cubes, Cuts, and Bad Cuts by x${format(player.bsm.cEffect, 4)}`}],
        ["display-text", function(){return `Your current combo is <h2 style="color: #0080FF; text-shadow: 0px 0px 10px #0080FF">${format(player.bsm.combo, 4)}</h2> cuts`}],
        ["blank", "8px"],
        ["display-text", function(){return "Click the 18 clickables in response to the type of cube that appears."}],
        "blank",
        "grid",
        "blank",
        ["row", [["clickable", 11], ["clickable", 12], ["clickable", 13], ["clickable", 41], ["clickable", 42], ["clickable", 43]]],
        ["row", [["clickable", 21], ["clickable", 22], ["clickable", 23], ["clickable", 51], ["clickable", 52], ["clickable", 53]]],
        ["row", [["clickable", 31], ["clickable", 32], ["clickable", 33], ["clickable", 61], ["clickable", 62], ["clickable", 63]]],
    ],

    infoboxes: {
        minigame: {
            title: "Beat Saber Minigame",
            body() { return "This is the Beat Saber Minigame. No Portal 2 jokes here. Unlike the DDR minigame, " +
                "there are no keybinds for this, because 18 keys would be too much on the keyboard. Anyway, " +
                "cubes will randomly spawn in, either on the left (red) or right (blue) side, with one of 8 directions (N, NE, E, SE, S, SW, W, or NW). " +
                "Similar to the DDR minigame (actually no, pretty much identical), you have a combo and highest combo. Normal Cuts add to the combo, Bad Cuts do nothing, and missing a note resets it. " +
                "Cuts are gained by matching color AND direction and Bad Cuts by matching one or the other. <br><br>" +
                "But what about the middle clickable? Well, if the cube has a circle on it, you can slice it in any direction to get a Cut. " +
                "However, if you press the middle \"jab\" button, you get x5 the Cuts! (Using the wrong color will result in Bad Cuts being affected.) " +
                "Cuts and Bad Cuts are counted when the cube is either 7x7 or 9x9 (second-largest and largest respectively)."
             },
            unlocked() {return true},
        },
    },

    layerShown(){
        if (hasUpgrade("bs", 61)) player.bsm.unlocked = true
        return player.bsm.unlocked
    },
})