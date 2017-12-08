/* Think about creating the <svg> elements as width: 100% and height: %100
 *  so that the animations always fit to the viewscreen and resize until
 *  they're small enough that cells can be removed evenly.
 *  That is, cellHeight and cellWidth only set the maximum size each dimension
 *  can be if while maintaining the proper number for the viewscreen.
 *  We change the number of cells only after a cycle through the cell dimension
 *
 * Trie structure?
 */


var surfaces = {};
const CELL_PARAM = { dim1 : 5, dim2 : 5 };


/******* Surface Functions                                      *******/

var calcSurfaceDim = function (ws, cp) {
    return {
        // Number of cells that fit in a generation given the window state
        sizegen : Math.floor(ws.docWidth / cp.dim1),
        // Number of generations that fit in the given window state.
        numgen : Math.floor(ws.docHeight / cp.dim2)
    }
};


var instantiateSurface = function (lib, dim, rule, elem, seed) {
    return {
        surface : lib.generateSurface(lib.generateRuleset(rule), dim, seed),
        lib : lib,
        elem : elem
    }
};


/******* DOM Manipulation Functions                             *******/

var WindowState = function () { 
    return {
        windowHeight : $(window).height(),
        windowWidth : $(window).width(),
        docHeight : $(document).height(),
        docWidth : $(document).width()
    }
};


var mutateDOMSurface = function (sf, ws) {
    //TODO
    //e.g. $('#' + id)
};


/******* Cellular Automata Libraries                            *******/
/*** (each manipulates a different type of Automata)                ***/

/* Library of 1-dimensional 3-bit Cellular Automata Functions (
 * TODO - THOUGHTS
 *      : Integrate some Trie structure to speed up string lookup and/or
 *          computation
 *
 * What is a cell?
 *  A cell has one of two states, alive or dead, represented by a binary digit
 *  of 1 or 0.
 *
 * What is a generation?
 *  A collection of cells.  In this implementation, a generation will be
 *  represented by a string of bits, whose bit values define the state of a
 *  cell.
 *
 * What is a surface?
 *  An ordered collection of generations.  Each generation should be of the
 *  same size. In this implementation, a surface is an Array of strings, each
 *  of which is one generation.
 *
 * What is a cellular automaton?
 *  A cellular automaton is a grid of cells that change state over
 *  time according to some rule defined by its neighbors.  In this
 *  implementation the grid is a single generation on the surface.  Its cells'
 *  neighbors are the previous generations cells at the index positions left
 *  of, equal to, and right of the current cell's index.
 *
 * An example using strings as the storage value for each generation
 *  surface:   c0  c1  c2  c3
 *  e.g.    g0  0   0   1   1       Generation Format = String of length 4
 *          g1  A   B   C   D       Neighbor Format = (left, center, right)
 *
 *          surface = [g0, g1]
 *          Format of Generation #0 (g0) = "0011"
 *          Generation Size = 4
 *          Number of Generations = 2
 *
 *          A's neighbors = (g0c3, g0c0, g0c1)
 *          B's neighbors = (g0c0, g0c1, g0c2)
 *          C's neighbors = (g0c1, g0c2, g0c3)
 *          D's neighbors = (g0c2, g0c3, g0c0)
 *
 *          A's value = ruleset(A's neighbors)
 *          B's value = ruleset(B's neighbors)
 *          C's value = ruleset(C's neighbors)
 *          D's value = ruleset(D's neighbors)
 */

const AutomataLib1D8bit = {
    /* Return Value:
     *      A surface, which is a rectangular array of strings representing
     *      the cell states of its generations.
     *
     * Parameters:
     *      ruleset:    Array with string keys of size 3.  The keys are a
     *                  bitstring mapping to the value of the binary digits 
     *                  of an 8-bit number, called the "rule".  Here, keys are
     *                  the states of a cell's neighbors, and the
     *                  corresponding value is the rule's digit at the key's 
     *                  numeral. e.g. For rule=30, "010" -> "1" & "000" -> "0"
     *       param:     Object with properties sizegen and numgen.
     *                  sizegen = number of cells in each generation.
     *                  numgen = number of generations in the surface.
     *       seed:      Optional string that acts as the first generation for
     *                  the generated surface.  Defaults to a string the size
     *                  of param.sizegen filled with "0" except for a single
     *                  centered "1" (left-bias e.g. length=4 -> seed="0100").
     */
    generateSurface : (ruleset, param, seed) => {
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

        //Starting with the seed generation, new generations are calculated
        //until all generations have been generated.
        surface = new Array(param.numgen);
        surface[0] = seed;
        for (let i = 1; i < param.numgen; i++) {
            surface[i] = this.birthGeneration(ruleset
                                             , surface[i - 1]
                                             , param.sizegen
                                             );
        }

        return surface;
    },

    birthGeneration : (ruleset, oldgen, sizegen) => {
        
    },
    
    /*Resizes the cellular automata by either truncating width/length in the 
     * event of a resize smaller operation, or by wrapping the width/length 
     * in the event of a resize larger operation.  Returns the resized surface
     *
     * e.g. initial surface: nGen = 4, sizeGen = 4
     *                       A B C D
     *                       E F G H
     *                       I J K L
     *                       M N O P
     *
     *      resize smaller: nGen=2, sizeGen=3
     *                       A B C                             
     *                       E F G                             
     *      resize larger: nGen=6, sizeGen=10
     *                       A B C D A B C D A B
     *                       E F G H E F G H E F
     *                       I J K L I J K L I J
     *                       M N O P M N O P M N
     *                       A B C D A B C D A B
     *                       E F G H E F G H E F
     */
    resizeGeneration : (surface, param) => {

    },

    generateRuleset : (rule) => {
        
    }
};


/******* Initialized Surfaces                                   *******/

surfaces.background = instantiateSurface(
    AutomataSurface1D8bit
    , calcSurfaceDim( WindowState() , CELL_PARAM)
    , 30
    , document.getElementById('bg-surface')
    , null
    );


/******* Event Triggers                                         *******/


$(document).ready(
    surfaces.map( sf => mutateDOMSurface(sf, WindowState()) )
);
    

$(window).on('resize',
    surfaces.map( sf => mutateDOMSurface(sf, WindowState()) )
);
