// make sure this (JS/jQuery) script loads only when the document is ready
$(function(){
    // jQuery vars
    var $body = $("body");
    var $restartButton = $body.children("h1").children("button");
    var $currentStatusDisplay = $body.children("h1").children("span");
    var $playArea = $body.children(".playArea");
    var $tiles = $playArea.children("div");

    var currentPlayer = "X";
    /**
     * Represents the current state (information) of the game
     *  
     * @param {any} oldState - stores the older state of the game if any. 
     * If there is an old state let us UPDATE this state to contain the information 
     * of the new state of our game else create a new state. This makes us remove the 
     * redundant steps if we create new state from scratch on every move of the player.
     */
    var state = function(oldState){
        /* whose turn is it in this state? */
        this.turn = "";

        /* number of moves of the AI player 
            initialized to 0*/
        this.movesCountOfAI = 0;

        /* result of the game in this state
            still running OR win OR draw - 
            initialize with still running*/
        this.result = "still running";

        /* board config of this state - initialize 
            with an empty array */
        this.board = [];

        /* Update the oldState, if any to construct 
        new State object for current game */
        if(typeof oldState !== "undefined"){
            // copy the board configuration
            var len = oldState.board.length;
            this.board = new Array(len);
            for(var numberOfTiles = 0; numberOfTiles < len; numberOfTiles++){
                this.board[numberOfTiles] = oldState.board[numberOfTiles];
            }

            // copy the movesCount, result, and turn of the old state
            this.movesCountOfAI = oldState.movesCountOfAI;
            this.result = oldState.result;
            this.turn = oldState.turn;
        }

        // method to update the current player
        this.advanceTurn = function(){
            // if current player is X make next player O and vice versa
            this.turn = this.turn === "X" ? "O" : "X";
        }

        /* count the number of empty cells and return an array containing
            the indices of the empty cells*/
        this.emptyCells = function() {
            var indices = [];
            for(var numberOfTiles = 0; numberOfTiles < 9 ; numberOfTiles++) {
                if(this.board[numberOfTiles] === "E") {
                    indices.push(numberOfTiles);
                }
            }
            return indices;
        }
       
        /* this method checks the terminal state of the game.
            updates the state's result variable to store the state.
            returns true if the game is in terminal state or else false */
        this.isTerminal = function(){
            // store the board configuration in some local variable
            var B = this.board;

            /* testify the rows if any of them has all 3 elements same
                since it is a 3 by 3 game.
                check the row indices 0-1-2, 3-4-5 and 6-7-8
                if all have the same element and also not E-empty*/
            for(var row = 0; row <= 6; row = row + 3){
                // if same player have consumed a row
                if(B[i] !== "E" && B[i] === B[i+1] && B[i+1] == B[i+2]){
                    // update the state result with player who has consumed the row
                    this.result = B[i] + "-won";
                    return true;
                }
            }

            /* testify the columns if any of them has all 3 elements same
                since it is a 3 by 3 game.
                check the column indices 0-3-6, 1-4-7 and 2-5-8
                if all have the same element and also not E-empty*/
            for(var column = 0; column <= 2; column = column++){
                // if same player have consumed a column
                if(B[i] !== "E" && B[i] === B[i+3] && B[i+3] == B[i+6]){
                    // update the state result with player who has consumed the column
                    this.result = B[i] + "-won";
                    return true;
                }
            }

            /* testify the diagonals if any of them has all 3 elements same
                since it is a 3 by 3 game.
                check the diagonal indices 0-4-8 and 2-4-6
                if all have the same element and also not E-empty*/
            for(var i = 0, j = 4; i <= 2; i = i + 2, j = j - 2){
                // if same player have consumed a diagonal
                // for 3 by 3 game the loop will have following two conditionsal
                // 1st diagonal(0-4-8) => B[0] !== "E" && B[0] === B[4] && B[4] == B[8]
                // 2nd diagonal(2-4-6) => B[2] !== "E" && B[2] === B[4] && B[4] == B[6]
                if(B[i] !== "E" && B[i] === B[i + j] && B[i + j] == B[i + 2*j]){
                    // update the state result with player who has consumed the diagonal
                    this.result = B[i] + "-won";
                    return true;
                }
            }

            // get the available cells - i.e all empty cells
            var availableCells = this.emptyCells();
            // if all cells are consumed or no cells are empty
            if(availableCells.length == 0){
                // update the state result of the game as draw
                this.result = "draw";
                // and return the termination state of the game as yes - true
                return true;
            } else{
                // return that the game is stll running or has not terminated - flase
                return false;
            }
        }
    }

    /**
     * Construct a game object for playing 
     * @param {any} aiPlayer : the AI player to be played game with (unused for this revision)
     *  
     */
    var game = function(aiPlayer){
        // initalize the ai player for this game
        this.ai = aiPlayer;

        // initialize a new game state
        this.currentState = new state();

        // initialize the new state with empty board state
        this.currentState.board = [ "E", "E", "E",
                                    "E", "E", "E",
                                    "E", "E", "E" ];
        
        // X playes first
        this.currentState.turn = "X";

        // initialize the game state to beginning
        this.status = "beginning";

        // 
        /**
         * 
         * following method advances the game to new state
         * @param {any} _state : new state to advance the game to
         */
        this.advanceGameTo = function(_state){
            // update what the current game state will be now
            this.currentState = _state;

            // if the state is terminal
            if(_state.isTerminal()){
                this.status = "Game Ended.";
                if(_state.result === "X-won"){
                    // update information that player X won
                    $currentStatusDisplay.html(_state.result);
                } else if(_state.result === "O-won"){
                    // update information that player O won
                    $currentStatusDisplay.html(_state.result);
                }else{
                    // update information that the game was draw
                    $currentStatusDisplay.html(_state.result);
                }
            }else{ // else if the state is not terminal
                if(this.currentState.turn === "X"){
                    // update information that the game is player X
                    $currentStatusDisplay.html(this.currentState.turn);
                }else{
                    $currentStatusDisplay.html(this.currentState.turn);
                }
            }
        }

        // start the game
        this.start = function(){
            if(this.status = "beginning"){
                // call advanceGameTo() with initial state
                this.advanceGameTo(this.currentState);
                // and update game state to running
                this.status = "running";
            }
        }
    }

    /* start a new game (for this revision since aiPlayer parameter for
    game function is unused let us send it value as 'novice') */
    var newgame = new game("novice");
    newgame.start();
    
    var AIAction = function(pos) {
        
            // public : the position on the board that the action would put the letter on
            this.movePosition = pos;
        
            /*
             * public : applies the action to a state to get the next state
             * @param state [State]: the state to apply the action to
             * @return [State]: the next state
             */
            this.applyTo = function(state_) {
                var next = new state(state_);

                //put the letter on the board
                next.board[this.movePosition] = state_.turn;

                if(state_.turn === "O")
                    next.movesCountOfAI++;
        
                next.advanceTurn();

                // alert(next.turn);
                
                return next;
            }
        };

    function takeABlindMove(turn) {
        var available = newgame.currentState.emptyCells();
        var randomCell = available[Math.floor(Math.random() * available.length)];
        
        var action = new AIAction(randomCell);

        var next = action.applyTo(newgame.currentState);
        
        $playArea.children("div[data-index='"+randomCell+"']").children("span").html(turn);

        newgame.advanceGameTo(next);
    }

    // clicking on each tile following event handler fires up
    $tiles.click(function(){
        alert(newgame.status);
        if(newgame.status == "running" && newgame.currentState.turn === "X" && !$(this).hasClass('occupied')){
            !$(this).hasClass('occupied') ? $(this).attr("class","occupied") : null;
            $(this).children("span").html(newgame.currentState.turn);
            newgame.currentState.advanceTurn();
            takeABlindMove(newgame.currentState.turn);
        }
    });

    
    


    // event-handler for restart button
    $restartButton.click(function(){
        // reload current page from server
        location.reload(true); 
    });

}); 