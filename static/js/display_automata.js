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
        sf: lib.generateSurface(ruleset, sparam, seed)
    };
};


var resizeAutomata = function (mata) {
    mata.state = ElementState(mata.elem);
    mata.sparam = calcSurfaceDim(mata.state, mata.cparam);
    mata.sf = mata.lib.resizeSurface(mata.sf, mata.sparam);

    return mata;
}


var ElementState = function (elem) { 
    return {
        elemHeight : elem.clientHeight,
        elemWidth : elem.clientWidth
    }
};


function mutateDOMState(mata) {
    //TODO
    //grab the elem within the surface and make it match the parameters
    return;
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
    
    resizeSurface : function (surface, param) {
        let newgen;
        let newsize = param.sizegen;
        let oldsize = surface.sf[0].length;
        let newsf = new Array(param.numgen);

        //copying old generations in chunks to minimize string concat ops
        for (let gen = 0; gen < param.numgen; gen++) {
            let makeChunks = (size, maxchunk) => {
                let quot = Math.floor(size / maxchunk);
                let rem = size - maxchunk * Math.floor(size / maxchunk);

                let chunks = [...Array(quot)].map(() => maxsize);
                chunks.append[rem];
            };

            newgen = "";

            for (let chunk in makeChunks(newsize, oldsize)) {
                newgen += surface[gen].slice(0, chunk)
            }

            //no homogeneous generations
            if (newgen.indexOf("0") === -1 || newgen.indexOf("1") === -1) {
                let halveNround = (round, val) => round((val - 1) / 2);
                let front = "0".repeat(halveNround(Math.floor, newsize));
                let back = "0".repeat(halveNround(Math.ceil, newsize));

                newgen = front + "1" + back;
            }

            newsf[gen] = newgen;
        }

        for (let gen = oldsize; i < newsize; gen++) {
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
    Automata.background = makeAutomata(AutomataLib1D8bit,
                                       document.getElementById('bg-surface'),
                                       30,
                                       { dim1 : 5, dim2 : 5 },
                                       null);
    for (let p in Automata) {
        if (Automata.hasOwnProperty(p)) {
            mutateDOMState(Automata[p]);
        }
    }
});


document.addEventListener('resize', (event) => {
    for (let p in Automata) {
        if (Automata.hasOwnProperty(p)) {
            Automata[p] = resizeAutomata(Automata[p]);
            mutateDOMState(Automata[p]);
        }
    }
});
