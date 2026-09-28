addLayer("a", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    resource: "Achievement Power", 
    row: "side",
    position: 0,
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievementPopups: true,
    achievements: {
        11: {
            name: "Your Rhythmic Journey",
            done() {return hasUpgrade("n", 11)},
            unlocked() {return true},
            tooltip() {return "Buy the first Note upgrade. +1 AP"},
            onComplete() {player.a.points = player.a.points.add(1)}
        },
        12: {
            name: "First Million Steps",
            done() {return player.points.gte("1e6")},
            unlocked() {return true},
            tooltip() {return "Have 1 million ME. +1 AP"},
            onComplete() {player.a.points = player.a.points.add(1)}
        },
        13: {
            name: "Creating is Always Fun",
            done() {return player.s.points.gte("1")},
            unlocked() {return true},
            tooltip() {return "Compose your first Song. +2 AP"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        14: {
            name: "Rapid-Releasing an EP",
            done() {return getResetGain("s").gte(4)},
            unlocked() {return true},
            tooltip() {return "Compose 4 Songs at once. +2 AP"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        15: {
            name: "2x2x2x2",
            done() {return hasUpgrade("n", 44)},
            unlocked() {return true},
            tooltip() {return "Have 16 (or 4x4) Note upgrades. +2 AP"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        16: {
            name: "Professional Producer",
            done() {return hasMilestone("s", 6)},
            unlocked() {return true},
            tooltip() {return "Have 6 Song milestones. +2 AP / Row completion bonus: +100 and x100 Notes."},
            onComplete() {player.a.points = player.a.points.add(2)}
        },

        21: {
            name: "SHOW ME YOUR MOVES!",
            done() {return player.ddr.points.gte(1)},
            unlocked() {return true},
            tooltip() {return "DDR reset for the first time. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        22: {
            name: "Infinite Musicality!",
            done() {return player.points.gte("1.79e308")},
            unlocked() {return true},
            tooltip() {return "Have 1.79e308 ME. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        23: {
            name: "Unbeatable Play",
            done() {return player.ddrm.combo.gte("500") &&
                player.ddrm.marvelous.gte("1e3") &&
                player.ddrm.great.gte("1e3") &&
                player.ddrm.almost.gte("1e3")
            },
            unlocked() {return true},
            tooltip() {return "Have at least 1,000 Marvelous, Great, and Almost arrows and have a DDR combo of at least 500. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        24: {
            name: "What Difficulty is This?",
            done() {return hasUpgrade("ddr", 41)},
            unlocked() {return true},
            tooltip() {return "Unlock the GROOVE RADAR. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        25: {
            name: "Dance Floor Mastery",
            done() {return hasChallenge("ddr", 31)},
            unlocked() {return true},
            tooltip() {return "Complete \"CHALLENGE\" DANCE LEVEL. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        26: {
            name: "Encore Extra Stage",
            done() {return hasUpgrade("n", 314)},
            unlocked() {return true},
            tooltip() {return "Unlock \"Full Combo\". +3 AP / Row completion bonus: x1e100 ME! WOW!"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        31: {
            name: "Groovin' Googol",
            done() {return player.ddr.groovePower.gte("1e100")},
            unlocked() {return true},
            tooltip() {return "Have 1e100 Groove Power. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        32: {
            name: "Inflated Dancing",
            done() {return getBuyableAmount("ddr", 22).gte(10)},
            unlocked() {return true},
            tooltip() {return "Max out \"Machine Enhancer\". +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        33: {
            name: "Infinity Combo",
            done() {return player.ddrm.combo.gte("1.79e308")},
            unlocked() {return true},
            tooltip() {return "Have a combo of 1.79e308. +3 AP"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        34: {
            name: "Slash the beats.",
            done() {return player.bs.points.gte(1)},
            unlocked() {return true},
            tooltip() {return "Beat Saber reset for the first time. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        35: {
            name: "Faster Recovery",
            done() {return hasUpgrade("bs", 14)},
            unlocked() {return true},
            tooltip() {return "Have 1 row of Beat Saber upgrades. That took a while, didn't it? +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        36: {
            name: "Apprentice Ninja",
            done() {return player.bsm.highestCombo.gte(25)},
            unlocked() {return true},
            tooltip() {return "Have a combo of at least 25 in Beat Saber. +5 AP / Row completion bonus: x500 Songs and x4 Cubes."},
            onComplete() {player.a.points = player.a.points.add(5)}
        },

        41: {
            name: "First (1e)Million Steps",
            done() {return player.points.gte("e1e6")},
            unlocked() {return true},
            tooltip() {return "Have 1e1,000,000 Musical Essence. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        42: {
            name: "Jumpin' n' Movin'",
            done() {return player.d.points.gte(1)},
            unlocked() {return true},
            tooltip() {return "Have 1 Distance. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        43: {
            name: "Jaroslav Beck: \"Big Combo\"",
            done() {return player.bsm.highestCombo.gte("1e10")},
            unlocked() {return true},
            tooltip() {return "Have 1 dialogue (10^10 or 1e10) BS combo. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        44: {
            name: "Expert+++++++++",
            done() {return hasUpgrade("bs", 64)},
            unlocked() {return true},
            tooltip() {return "Unlock BS difficulties. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        45: {
            name: "Perpetual Workout",
            done() {return player.bs.points.gte("1e100")},
            unlocked() {return true},
            tooltip() {return "Have 1e100 Cubes. +5 AP"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
        46: {
            name: "DanceDance-Upgrade",
            done() {return hasUpgrade("ddr", 54)},
            unlocked() {return true},
            tooltip() {return "Have 20 DDR upgrades. +5 AP / Row completion bonus: x1e10 Movement and max Stamina is always at least 1e50."},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
    },
})