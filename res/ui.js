/**
 * @fileOverview Implements the game cycle, managing the display of messages according to game state and 
 * determining whether a round has been won or not.
 * @author hqcasanova develop@hqcasanova.com
 */
(function() {
    /** Constants **/
    var NUM_SWAPS = 3;

    /** Variables **/
    var introEl = document.getElementById('intro');                 //root DOM element for the intro view
    var gameEl = document.getElementById('game');                   //root DOM element for the game view
    var loaderEl = introEl.getElementsByClassName('loader')[0];     //DOM element for the "loading" spinner
    var continueEl = introEl.getElementsByClassName('button')[0];   //DOM element for the "continue" button
    var messagesEl = gameEl.getElementsByClassName('messages')[0];  //DOM element for the message container
    var cupsEl = gameEl.getElementsByClassName('cups')[0];          //DOM element for the cup container
    var ballEl = cupsEl.getElementsByClassName('ball')[0];          //DOM element for the ball
    var newRoundEl = gameEl.getElementsByClassName('new-round')[0]; //DOM element for the "new round" button
    var gameState = 0;                                              //matches with the message index
    var loadedImgs = 0;                                             //number of images fully preloaded

    /**
     * Triggers the change in the main element's opacity on clicking the "continue" button
     * @param {Object} e Event object
     */
    function fadeIntro (e) {
        if (e.target == continueEl) {
            
            //Prevents any spurious event
            e.preventDefault();     
            e.stopPropagation();
            
            //Fades the introduction out
            introEl.className += ' fade';  newRoundEl.textContent = whichTransitionEvent();
        }
    }

    /**
     * Flow-wise, hides the intro altogether and shows the game once the intro has completely faded out
     */
    function afterIntro () {
        introEl.style.display = 'none';
        gameEl.style.display = 'block';
    }

    /**
     * Updates the message corresponding to the current game state.
     * @param {Number} state Integer value representing for the next state
     */
    function nextState (state) {
        messagesEl.children[gameState].style.display = 'none';
        gameState = state;
        messagesEl.children[gameState].style.display = 'block';
    }

    /**
     * Generates a random integer between 0 and a maximum value
     * @param {Number} max Maximum boundary
     */
    function getRandomInt(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    /**
     * Randomly selects two cup elements and swaps their positions
     */
    function moveCups () {
        var cupArray = Array.prototype.slice.call(cupsEl.children); //standardised array of cup elements
        var numCups = cupArray.length;                      //number of cups
        var randomIndex = getRandomInt(numCups - 1);        //randomly generated array index
        var cup1 = cupArray[randomIndex];                   //selects first cup
        cupArray.splice(randomIndex, 1);                    //removes selected cup from array
        var cup2 = cupArray[getRandomInt(numCups - 2)];     //selects second cup

        //Turns all cups upside down
        cupsEl.className += ' bottom';
        ballEl.style.display = 'none';

        //Swap cups, moving the ball if any of them has it
        if (cup1.children.length) {
            cup2.appendChild(cup1.children[0]);
        } else if (cup2.children.length) {
            cup1.appendChild(cup2.children[0]);
        }
    }

    /**
     * If "new round" is clicked and the cups are unturned, they are moved around three times 
     * before allowing selection
     * @param {Object} e Event object
     */
    function shuffle (e) {
        var i = 0;

        if ((e.target == newRoundEl) && (gameState != 1)) {
            
            //Prevents any spurious event    
            e.stopPropagation();

            //Prevents starting a new round before finishing the current one
            e.target.disabled = true;

            for (i; i < NUM_SWAPS; i++) {
                moveCups();
            }
            nextState(1);
        }
    }

    /**
     * If an unturned cup is clicked, determine if the player has won (a ball element is contained in the cup element)
     * @param {Object} e Event object
     */
    function end (e) {
        if ((e.target.className == 'cup') && (gameState == 1)) {

            //Prevents any spurious event     
            e.stopPropagation();

            //Turn cups back upside
            cupsEl.classList.remove('bottom');
            ballEl.style.display = 'block';

            //Show the corresponding message. If the element has any child element, then it must have the ball
            if (e.target.children.length) {
                nextState(2);
            } else {
                nextState(3)
            }

            //Re-allows starting new rounds
            newRoundEl.disabled = false;
        }
    }

    /**
     * Determines the name of the transition event supported by the current browser
     * @author <a href="http://davidwalsh.name/css-animation-callback">David Walsh</a> 
     */
    function whichTransitionEvent () {
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition'      : 'transitionend',
            'OTransition'     : 'oTransitionEnd',
            'MozTransition'   : 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }
        var t;

        for (t in transitions) {
            if (el.style[t] !== undefined){
                return transitions[t];
            }
        }
    }

    //Pre-loads other not-yet-rendered resources before proceeding to the game
    function hideSpinner () {
        loaderEl.style.display = 'none';
        continueEl.style.display = 'inline-block';       
    }

    //Enable js-only styles
    document.body.className = '';

    //Delegated events for intro view
    introEl.addEventListener('click', fadeIntro, false);
    introEl.addEventListener(whichTransitionEvent(), afterIntro, false);

    //Delegated events for game view
    gameEl.addEventListener('click', shuffle, false);
    gameEl.addEventListener('click', end, false);

    //Loading
    window.addEventListener('load', hideSpinner);
})();
