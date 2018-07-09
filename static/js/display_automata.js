/* Think about creating the <svg> elements as width: 100% and height: %100
 *  so that the animations always fit to the viewscreen and resize until
 *  they're small enough that cells can be removed evenly.
 *  That is, cellHeight and cellWidth only set the maximum size each dimension
 *  can be if while maintaining the proper number for the viewscreen.
 *  We change the number of cells only after a cycle through the cell dimension
 *
 * Trie structure?
 */


var Automata = {};


var calcSurfaceDim = function (es, cp) {
    return {
        // Number of cells that fit in a generation given the window state
        sizegen : Math.floor(es.elemWidth / cp.dim1),
        // Number of generations that fit in the given window state.
        numgen : Math.floor(es.elemHeight / cp.dim2)
    }
};


var makeAutomata = function (lib, elem, rule, cparam, seed) {
    state = ElementState(elem);
    sparam = calcSurfaceDim(state, cparam);
    ruleset = lib.generateRuleset(rule);

    return {
        lib: lib,
        elem: elem,
        state: ElementState(elem),
        ruleset: ruleset,
        cparam: cparam,
        sparam: sparam,
        sf: lib.generateSurface(ruleset, sparam, seed),
        draw: drawElementFunction[elem.tagName]
    };
};


var resizeAutomata = function (mata) {
    mata.state = ElementState(mata.elem);
    mata.sparam = calcSurfaceDim(mata.state, mata.cparam);
    mata.sf = mata.lib.resizeSurface(mata);

    return mata;
}


var ElementState = function (elem) { 
    console.log(elem);
    return {
        elemHeight : elem.parentElement.clientHeight,
        elemWidth : elem.parentElement.clientWidth
    };
};


var drawElementFunction = {
    'CANVAS' : drawCanvas,
    'DIV' : mutateDivState
}


function mutateDivState(mata) {
    //TODO
    //grab the elem within the surface and make it match the parameters
    //by drawing div containers
    return;
}

function drawCanvas(mata) {
    //resize canvas dimensions
    mata.elem.height = mata.state.elemHeight;
    mata.elem.width = mata.state.elemWidth;

    let mod = (val, div) => val - div * Math.floor(val / div);

    let ctx = mata.elem.getContext("2d");
    //Param are: lib, elem, state {elemHeight, elemWidth}, ruleset
    ////         cparam {dim1, dim2}, sparam {sizegen, numgen}
    ////         sf, draw
    //

    function drawSurface() {
        let x = 0, y = 0, g;
        let wid = mata.state.elemWidth / mata.sparam.sizegen;
        let len = mata.state.elemHeight / mata.sparam.numgen;

        for (g = 0; g < mata.sparam.numgen; g++) {
            drawGeneration(g);
        }
    }

    function drawGeneration(gen) {
        let wid = mata.state.elemWidth / mata.sparam.sizegen;
        let len = mata.state.elemHeight / mata.sparam.numgen;

        let c;
        let x = 0;
        let y = gen * len;

        ctx.clearRect(x, y, mata.state.elemWidth, len);
        ctx.beginPath();
        for (c = 0; c < mata.sparam.sizegen; c++) {
            if (mata.sf[gen][c] === "1") {
                ctx.rect(x, y, wid, len);
            }
            x += wid;
        }
        ctx.fill();
    }


    function animationLoop() {
        bgAF = requestAnimationFrame(animationLoop);
        mata.sf[era % mata.sparam.numgen] = mata.lib.birthGeneration(mata.ruleset,
                                                mata.sf[mod(era - 1, mata.sparam.numgen)],
                                                mata.sparam.sizegen);
        drawGeneration(era % mata.sparam.numgen);
        era += 1;
    }

    drawSurface();
    animationLoop();
}



var AutomataLib1D8bit = {
    generateSurface : function (ruleset, param, seed) {
        let surface = null;
        //If parameter is not well initialized, nothing to generate.
        if (!param || param.numgen < 0 || param.sizegen < 0) {
            return surface;
        }

        //If seed is not properly intialized, produce a default seed.
        if (!seed || seed.length != param.sizegen) {
            let halveNround = (round, val) => round((val - 1) / 2);
            let front = "0".repeat(halveNround(Math.floor, param.sizegen));
            let back = "0".repeat(halveNround(Math.ceil, param.sizegen));
            seed = front + "1" + back;
        }

        surface = new Array(param.numgen);
        surface[0] = seed;
        for (let i = 1; i < param.numgen; i++) {
            surface[i] = this.birthGeneration(ruleset,
                                              surface[i - 1],
                                              param.sizegen);
        }

        return surface;
    },

    birthGeneration : function (ruleset, oldgen, sizegen) {
        let hood, newgen = "";       
        let mod = (val, div) => val - div * Math.floor(val / div);

        for (let i = 0; i < sizegen; i++) {
            hood = oldgen[ mod(i - 1, sizegen) ]
                   + oldgen[ mod(i, sizegen) ]
                   + oldgen[ mod(i + 1, sizegen) ];
            newgen += ruleset[hood];
        }

        return newgen;
    },
    
    resizeSurface : function (mata) {
        let newgen;
        let newsize = mata.sparam.sizegen;
        let oldsize = mata.sf[0].length;
        let newsf = new Array(mata.sparam.numgen);

        let halveNround = (round, val) => round((val - 1) / 2);

        let makeChunks = (size, maxchunk) => {
            let quot = Math.floor(size / maxchunk);
            let rem = size - maxchunk * Math.floor(size / maxchunk);

            let chunks = [];
            for (let i = 0; i < quot; i++) {
                chunks.push(maxchunk);
            }
            chunks.push(rem);

            return chunks;
        };

        //copying old generations in chunks to minimize string concat ops
        let copysize;
        for (let gen = 0; gen < mata.sparam.numgen; gen++) {
            newgen = "";

            copysize = makeChunks(newsize, oldsize);
            for (let c in copysize) {
                newgen += mata.sf[gen].slice(0, copysize[c]);
            }

            //no homogeneous generations
            
            if (newgen.indexOf("0") === -1 || newgen.indexOf("1") === -1) {
                let front = "0".repeat(halveNround(Math.floor, newsize));
                let back = "0".repeat(halveNround(Math.ceil, newsize));

                newgen = front + "1" + back;
            }

            newsf[gen] = newgen;
        }

        for (let gen = oldsize; gen < newsize; gen++) {
            newsf[gen] = newsf[gen % oldsize];
        }

        return newsf;
    },

    generateRuleset : function (rule) {
        let rules = [];
        
        for (let pos = 0; pos < 8; pos++) {
            let pad = (binary, ndigits) => 
                ("0".repeat(ndigits) + binary).slice(-1 * ndigits);

            let state = 0x1 & (rule >>> pos);

            rules[ pad(pos.toString(2), 3) ] = state.toString(2);
        }

        return rules;
    }
};


document.addEventListener("DOMContentLoaded", (event) => {
    era = 0;
    console.log('domcontentloaded');
    window.addEventListener("resize", resizeThrottler);

    Automata.background = makeAutomata(AutomataLib1D8bit,
                                       document.getElementById('bg-surface'),
                                       30,
                                       { dim1 : 5, dim2 : 5 },
                                       null);
    for (let p in Automata) {
        if (Automata.hasOwnProperty(p)) {
            Automata[p].draw(Automata[p]);
        }
    }
});

var rszAF, bgAF, era;

function resizeThrottler () {
    cancelAnimationFrame(bgAF);
    resizePageEvent();
}

function resizePageEvent() {
    for (let p in Automata) {
        if (Automata.hasOwnProperty(p)) {
            Automata[p] = resizeAutomata(Automata[p]);
            cancelAnimationFrame(bgAF);
            Automata[p].draw(Automata[p]);
        }
    }
}
