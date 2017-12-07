//Browser viewport height and width
var windowHeight;
var windowWidth;
//HTML document height and width
var docHeight;
var docWidth;
//Cell element height and width
var cellHeight;
var cellWidth;
//Cell data structures
var nCurrentGen = 0; //Current Generation ( value range=[0, nVisibleGen-1] )
var nNextGen = 1; //Next Generation ( value range=[0, nVisibleGen-1] )
var nVisibleGen = 0; //Number of Generations that fit on the document
var genSizeDisp = 0; //Number of displayed cells in a single generation
var genSizeBytes = 50; //Number of bytes that represent the state of cells
var currentRule; //integer value ( range=[0, 255] ) that generates ruleset
var ruleset; //Mapping of neighborhood value to cell state

//Stores the old generations' state.
//  Each generation is stored as an integer whose n-bit representation (where
//  n is the number of cells in each generation)
var surfaceState = [];

$(document).ready(function() {
    getSizeParams();
    initializeCellElements();
});

$(window).on('resize', function () {
    old_h = docHeight;
    old_w = docWidth;
    getSizeParams();
    if (old_h !== docHeight || old_w !== docWidth) {
        growCellGenerations();
        buildCellElements();
    }
});

function getSizeParams() {
    windowHeight = $(window).height();
    windowWidth = $(window).width();
    docHeight = $(document).height();
    docWidth = $(document).width();
    cellWidth = 5;
    cellHeight = 5;
}

function getAutomataParams() {
    //Initialize Data Structures and Global Variables
    nVisibleGen = Math.floor(docHeight / cellHeight);
    genSizeDisp = Math.floor(docHeight / cellHeight);
    while (genSizeDisp > genSizeBytes * 32) {
        genSizeBytes = 2 * genSizeBytes;
    }
    nCurrentGen = 0;
    nNextGen = 1;
    arrCurrentGen = new Array(genSizeDisp);
    arrNextGen = new Array(genSizeDisp);
    currentRule = 31;
    ruleset = generateRuleset(currentRule);
}

function initializeCellElements() {
    getAutomataParams();
    //Generate DOM Elements representing the Cellular Automata

    //surface is the div.background's id tag in which our automata survive
    let surface = '';
    for (let ngen = 0; ngen < nVisibleGen; ngen++) {
        //HTML representation of a single generation
        //  generation id's consist of "g<gen#>"
        let genrow = '<div class="generation" id="g' + ngen + '">\n\t';
        surface += genrow;
        for (let ncell = 0; ncell < genSizeDisp; ncell++) {
            //HTML representation of a single cell
            //  cell id's consist of "c<gen#>.<cell#>"
            cell = '<div class="cell" id="c' + ngen + '.' + ncell + '"></div>';
            surface += cell;
        }
        surface += '</div>\n';
    }
    //add all generation containers to the end of the background div element
    $("#surface").append(surface);
}

function generateRuleset(n) {
    rules = new Array(8);
    for (let i = 0; i < 8; i++) {
        rules[i] = (0x1 << i) & n;
    return rules;
}

function growCellGenerations() {
    nOldGen = nVisibleGen;
    nOldBytes = genSizeBytes;
    //Initialize Data Structures and Global Variables
    getAutomataParams();
    
    //resize currently existing generations:
    //  expansion - extend surface by wrapping and repeating elements as if
    //              the background was projected onto a cylinder.
    //  contraction - delete oldest generations until the proper number of gen
    nextState = [];
    genStep = (nOldGen < nCurrentGen) ? 1 : -1;
    //Offset to insure newest generations are retained when resizing
    //NOTE: DOESN'T ACTUALLY GET THE NEWEST GENERATIONS
    //YOU HAVE TO BASE IT OFF THE CURRENT GENERATION 
    //(e.g. curr_gen - nOldGen
    offset = Math.max(0, nOldGen - nCurrentGen);
    //Copy over existing generations
    for (let old_gen = offset, new_gen = 0
        ; old_gen < nCurrentGen || old_gen < nOldGen
        ; old_gen += 1, new_gen += 1) {

        nextState[new_gen] = surfaceState[old_gen];
    }
    //Calculate new generations if needed
    //birthGenenration(integer)

    //Change generation size

    //perform the larger operation first
    
    //either append 
    
    //relay window size observation
    return;
}
function buildCellElements(more_or_less) {
    if (more_or_less === undefined) {
        //determine if the window was resized larger or smaller
    }

    //build or break the cell elements according to the decision more_or_less
    if (more_or_less) {

    } else {

    }
}

function randomBoolean() {
    return Math.random() >= 0.5;
}
