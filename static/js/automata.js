/* Library of Cellular Automata Functions
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
 *  neighbors are the previous generations cells at the index positions right
 *  of, equal to, and right of the current cell's index.
 *
 * An example using 4-bit integers as the storage value for all generations
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

 /*
 * Returns a Cellular Automata surface matching the function's parameters.
 *
 * Function Parameters:
 *  ruleset: Contains 8 3-bit rules that determines a cells state.
 *  nGen: The number of generations that exist on the surface at one time.
 *  sizeGen: The number of cells within each generation.
 *  seed: A generation that will act as generation #0 of the surface.
 *        If not initialized, the seed will be a single centered alive cell.
 */
//TODO: Change arguments below to (ruleset, surface_param, seed)
//  where surface_param = { ngen: int, popgen: int}
function generateSurface(ruleset, nGen, sizeGen, seed) {
    //number and size of generations must be greater than 0.
    if (!(nGen > 0 && sizeGen > 0)) {
        console.log("generateSurface failed: nGen & sizeGen must be > 0");
        return;
    }
    //If seed has been set improperly or not at all, the algorithm defaults
    //to a single alive cell located at the center of the seed generation
    if (seed === undefined || seed === null || seed.length !== sizeGen) {
        let front = "0".repeat(Math.floor((sizeGen - 1) / 2));
        let back = "0".repeat(Math.ceil((sizeGen - 1) / 2));
        seed = front + "1" + back;
    }
    //Starting with the seed generation, new generations are calculated until
    //nGen is reached.
    let surface = new Array(nGen);
    surface[0] = seed;
    for (let i = 1; i < nGen; i++) {
        surface[i] = birthGeneration(ruleset, surface[i - 1], sizeGen);
    }
    
    return surface;
}

function birthGeneration(ruleset, oldGen, sizeGen) {
    let hood;
    var newGen;
    //Calculate left overlapping neighbors for first cell
    hood = oldGen[sizeGen - 1] + oldGen[0] + oldGen[1 % sizeGen];
    newGen = ruleset[hood];
    //Iterate through cells with non-wrapping neighbors
    for (let i = 1; i < sizeGen - 1; i++) {
        hood = oldGen[i - 1] + oldGen[i] + oldGen[i + 1];
        newGen += ruleset[hood];
    }
    //Calculate right overlapping neighbors for last cell
    //left's calculation uses a mathematical (vs. JS's) modulus operation
    hood = oldGen[(((sizeGen - 1) % sizeGen) + sizeGen) % sizeGen]
           + oldGen[sizeGen - 1] 
           + oldGen[0];
    newGen += ruleset[hood];

    return newGen;
}

/*Resizes the cellular automata by either truncating width/length in the event
 * of a resize smaller operation, or by wrapping the width/length in the event
 * of a resize larger operation.  Returns the resized surface.
 *
 * e.g. initial surface: nGen = 4, sizeGen = 4
 *                       A B C D
 *                       E F G H
 *                       I J K L
 *                       M N O P
 *
 *      resize smaller: nGen=2, sizeGen=3; resize larger: nGen=6, sizeGen=10
 *                      A B C                             A B C D A B C D A B
 *                      E F G                             E F G H E F G H E F
 *                                                        I J K L I J K L I J
 *                                                        M N O P M N O P M N
 *                                                        A B C D A B C D A B
 *                                                        E F G H E F G H E F
 */
function resizeGeneration(surface, nGen, sizeGen) {
    var newSf; //New Surface
    let oldNGen = surface.length;
    let oldSizeGen = surface[0].length;
    let resized_gen, front, back;
    newSf = new Array(nGen);
    //change generation # to min(old gen #, new gen #)
    for (let i = 0; i < nGen && i < oldNGen; i++) {
        resized_gen = "";
        //change size of existing generations
        for (let ng = sizeGen; ng >= 0; ng = ng - oldSizeGen) {
            if (ng > oldSizeGen)
                resized_gen += surface[i].slice(0, oldSizeGen);
            else
                resized_gen += surface[i].slice(0, ng);
        }
        //Make sure you don't create a homogenous generation: all 1s or all 0s
        //  If so, reset the generation to its seed state.
        if (resized_gen.indexOf("0") === -1 
            || resized_gen.indexOf("1") === -1) {
                front = "0".repeat(Math.floor((sizeGen - 1) / 2));
                back = "0".repeat(Math.ceil((sizeGen - 1) / 2));
                resized_gen = front + "1" + back;
        }
        newSf[i] = resized_gen;
    }
    //copy generations up to new gen #, if (new gen # > old gen #)
    for (let i = oldNGen; i < nGen; i++) {
        newSf[i] = newSf[i % oldNGen];
    }

    return newSf;
}

function generateRuleset(rule) {
    var rules = [], res;
    //rules = new Array(8);
    for (let i = 0; i < 8; i++) {
        res = 0x1 & (rule >>> i);
        rules[("000" + i.toString(2)).slice(-3)] = res.toString(2);
    }
    return rules;
}
