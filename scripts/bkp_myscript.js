// make sure this (JS/jQuery) script loads only when the document is ready
$(function(){
    // jQuery vars
    var $body = $("body");
    var $restartButton = $body.children("h1").children("button");
    var $currentPlayerDisplay = $body.children("h1").children("span");
    var $playArea = $body.children(".playArea");
    
    // following X to get fancy X to display on board
    var unicodeCross = "\u2A2F";
    /* Players are either "playerX" and "playerO" 
       Initialize current player to O.*/
       var currentPlayer = "playerO";
       var playerX = "playerX";
       var playerO = "playerO";
       var player = "player"; // just a variable to contain player string

    /* 
        State information:
        0 : player "O" occupies the area.
        1 : player "X" occupies the area.
        2 : none of the player occupies the area.
        Make these state global variables.
        Following function returns the correct state to be 
        updated for the boardState
    */

    var playerOTileState = 0;
    var playerXTileState = 1;
    var emptyTileState = 2;

    var tileStateForPlayer = function(currentPlayer){
        switch(currentPlayer){
            case playerX : return playerXTileState;
            case playerO : return playerOTileState;
            default : return emptyTileState;
        }
    }
    
    // jquery object that stores all tile dom elements
    var $tiles = $playArea.children("div");
    
    // Initial state of the board is all empty.
    // Remainder : emptyTileState is denoted with 2
    var boardState = [ 2, 2, 2,
                       2, 2, 2,
                       2, 2, 2 ];

    /* References to the board tile for indexing */
    var boardTileReferences = [ "00", "01", "02",
                                "10", "11", "12",
                                "20", "21", "22" ];
    
    /* Check for identical elements in row, column or diagonal and return a promise*/
    var checkWinState = function(){
        // return a promise on this function call so 
        // that aschyncronicity, if any, will work
        return new Promise( function(resolve, reject) {
            // following array contains all the possible rows and columns
            // and diagonals of the 3 by 3 matrix starting index at 0 and
            // implemented with a 1-D array
            var rowColDigs = ["012", "345", "678", // rows of boardState
                            "036", "147", "258", // columns of boardState
                            "048", "246"];       // diagonals of boardState
            
            // declared variables to be used later
            var currentRowColDig;
            var firstIndexElement;
            var iscurrentRowColDigEqual;
            var boardStateElementsForCurrentRowColDig = [];
            var gameState = [];
            // initialize gameState with default false values
            gameState.push({"boardStateElement" : "null"});
            gameState.push({"whichRowColDig" : "null"});

            // iterate through each cell in rowColDigs array
            // used every() rather than foreach() because of the 3rd reason
            // given here: https://stackoverflow.com/a/6260865
            rowColDigs.every(function(value, index){            
                currentRowColDig = value.split("");
                // console.log("currentRowColDig :"+ value);
                // convert each cell value with its number and replace
                currentRowColDig.forEach(function(value, index){
                    boardStateElementsForCurrentRowColDig[index] = boardState[parseInt(value)];
                    // console.log("boardstate value for index "+index+" is "+boardState[parseInt(value)] + " or " + boardStateElementsForCurrentRowColDig[index]);
                });
                console.log("currentRowColDigNos :"+ currentRowColDig.toString());
                console.log("value of boardState for current currentRowColDigNos: "+ boardStateElementsForCurrentRowColDig.toString());
                
                
                // take the first element of the above array and 
                // compare against every other element in the array
                firstIndexElement = boardStateElementsForCurrentRowColDig[0];
                console.log("Value of first index for current row/col/dig: "+boardStateElementsForCurrentRowColDig[0]);

                // try to test if every element in the now extracted array from boardState are equal
                // ref: https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_every3
                // but change the else part in hasSameElements() in above code with "return (el === arr[index - 1]);"
                // since you are working with arrays and not objects as in the original example in the link
                function hasSameElements(el,index,arr) {
                    // Do not test the first array element, as you have nothing to compare to
                    // Also for our game do not test the cell if the value is 2 since it is the initial 
                    // state of the board and all element is 2
                    if (index === 0){
                        return true;
                    } else{
                        //do each array element value match the value of the previous array element
                        return (el === arr[index - 1]);
                    } 
                }

                console.log(boardStateElementsForCurrentRowColDig.every(hasSameElements));

                // if every element in current row or column or diagonal is equal 
                // update the game state with the value in the same row or column or diagonal
                // and the row or column or diagonal itself
                if(boardStateElementsForCurrentRowColDig.every(hasSameElements)){
                    gameState.boardStateElement = boardStateElementsForCurrentRowColDig[0].toString();
                    gameState.whichRowColDig = currentRowColDig.toString();                
                }

                // exit the every() loop on the array as soon as you find that 
                // there is either a row or a column or a diagnol equal
                return !boardStateElementsForCurrentRowColDig.every(hasSameElements);            
            });
        // send gameState either updated with the winner or just like that with null values via promise
        if(gameState.boardStateElement != "null"){
            // return gameState with winStates
            resolve(gameState);
        } else{
            // return a string that NoOneWon
            reject("NoOneWon");
        }
            
    });
    }

    /* following function:
        1. Updates the board state
        2. Makes the consumed board unclickable */
    var updateBoard = function(tileConsumed){
        // return a promise on this function call so 
        // that aschyncronicity, if any, will work
        return new Promise( function(resolve, reject) {
            var updateIndex = boardTileReferences.indexOf(tileConsumed.slice(-2));
            // update the boardState for index of tile
            // where the currentPlayer clicked, with current players tile state
            boardState.splice(updateIndex, 1, tileStateForPlayer(currentPlayer)); 
            
            // now udpate current player with next player
            currentPlayer == playerO ? currentPlayer = playerX : currentPlayer = playerO;
            
            // update current player display
            $currentPlayerDisplay.html(currentPlayer.charAt(currentPlayer.length-1));
            
            // check for win state
            var winStatePromise = checkWinState();
            winStatePromise.then(function(winStateSuccess){
                winStateSuccess.push({"winStateMessage":"win"});
                resolve(winStateSuccess);
            },function(winStateFailure){
                // if all tiles are consumed i.e. no empty tile or no 2 on boardState
                if(boardState.indexOf(2) == -1 && winStateFailure == "NoOneWon"){
                    // Send Draw Message
                    winStateFailure = "Draw";
                    reject(winStateFailure);
                }else {
                    winStateFailure = "Continue";
                    reject(winStateFailure);
                }
            });
        });
    }

    // event-handler for each board tiles
    $tiles.click(function(){
        // disable pointer events on consumed area
        // change cursor to not-allowed
        // and display it as red to notify already consumed by O
        // and display it as blue to notify already consumed by X
        console.log($(this).attr("class"));
        var tileColorUpdate;
        currentPlayer == playerO ? tileColorUpdate = "rgb(243, 191, 191)" : tileColorUpdate = "rgb(175, 167, 241)";
        $(this).css({
            "pointer-events": "none",
            "cursor" : "not-allowed",
            "background-color" : tileColorUpdate
        });
        // update the tile with also the player name
        // current player on tile
        var currentPlayerTileName = currentPlayer.charAt(currentPlayer.length-1);
        currentPlayerTileName == "X" ? currentPlayerTileName = unicodeCross : null;
        $(this).children("span").html(currentPlayerTileName);
        
        // call updateBoard() to update the board state
        var updateBoardPromise = updateBoard($(this).attr("class"));
        updateBoardPromise.then(function(winStateSuccess){
            var boardStateString = boardState[0] + ", " + boardState[1] + ", " + boardState[2] + ", \n" +
            boardState[3] + ", " + boardState[4] + ", " + boardState[5] + ", \n" +
            boardState[6] + ", " + boardState[7] + ", " + boardState[8] + "\n" +
            "You won! Player-"+winStateSuccess.boardStateElement + "\n"+
            "Row/column/dig was:"+winStateSuccess.whichRowColDig + "\n" +
            "Winmessage :" + winStateSuccess.winStateMessage;            
            $playArea.html(boardStateString);
        },function(winStateFailure){
            if(winStateFailure = "Draw"){
                $playArea.html("The Game was a Draw!");
            }else if(winStateFailure = "Continue"){
                alert("Next Player May Continue!");
            }
        });
    });

    // event-handler for restart button
    $restartButton.click(function(){
        // reload current page from server
        location.reload(true); 
    });

}); 