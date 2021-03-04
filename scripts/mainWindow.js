/****************************\
 ============================
 
      USER INPUT HANDLERS

 ============================              
\****************************/

// update board
function updateBoard(moveNumber) {
  // update UBB board
  gotonum(moveNumber);
  
  // get current move
  let currentMove = document.getElementById('shownow').value.split('/')[0];
  let UBBfen = getFENTEXT(P[currentMove]);
  
  // update engine board
  engine.setBoard(UBBfen);
  
  // update GUI board
  board.position(UBBfen);
  
  /*if (engine.getPiece(targetSquare) && moveStack.count > 0 && moveStack.count < moveStack.moves.length - 1) {
    document.getElementById(targetSquare).style.backgroundColor = SELECT_COLOR;
    playSound(move);
  }*/
}

// show first move of the game
function firstMove() {
  updateBoard('First');
}

// take move back
function previousMove() {
  updateBoard('Prev');
}

// make next move
function nextMove() {
  updateBoard('Next');
}

// show last move of the game
function lastMove() {
  updateBoard('Last');
}

/****************************\
 ============================
 
       DPXQ INTEGRATION
  
 ============================              
\****************************/

// add move to move list view
function addMove() {
  let moveList = document.getElementById('movelist')
  let moveItem = document.createElement('li');
  let UBBMove = document.getElementById('move_' + engine.getPly()).innerText;
  moveItem.id = 'UBB_move_' + engine.getPly();
  moveItem.classList = 'btn list-group-item list-group-item-action m-0 p-0';
  moveItem.style = 'font-size: 16px';
  moveItem.textContent = UBBMove;
  moveItem.setAttribute('onclick', 'updateBoard(parseInt(this.id.split("move_")[1]))');
  moveList.appendChild(moveItem);
}

// update DPXQ board
function updateUBB(source, target) {
  let sourceFile = source[0].charCodeAt() - 'a'.charCodeAt();
  let sourceRank = 9 - parseInt(source[1]);
  let targetFile = target[0].charCodeAt() - 'a'.charCodeAt();
  let targetRank = 9 - parseInt(target[1]);
  let ubbSource = sourceFile.toString() +  sourceRank.toString();
  let ubbTarget = targetFile.toString() + targetRank.toString();

  // make move on UBB board
  getMove(ubbSource);
  getMove(ubbTarget);
  
  // add move to UBB move list
  addMove();
}


/****************************\
 ============================
 
    USER CONTROL FUNCTIONS
  
 ============================              
\****************************/

// on dropping piece
function onDrop (source, target) {
  let move = source + target;
  let validMove = engine.moveFromString(move);

  // invalid move
  if (validMove == 0) return 'snapback';
  
  let legalMoves = engine.generateLegalMoves();
  let isLegal = 0;
  
  for (let count = 0; count < legalMoves.length; count++) {
    if (validMove == legalMoves[count].move) isLegal = 1;  
  }
  
  // illegal move
  if (isLegal == 0) return 'snapback';
  
  // make move on engine's board
  engine.makeMove(validMove);    
  engine.printBoard();
  
  // sync with DPXQ board
  updateUBB(source, target);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(engine.generateFen());
}


/****************************\
 ============================
 
     ELECTRON INTERACTION

 ============================              
\****************************/

/*const electron = require('electron');
  const {ipcRenderer} = electron;
  const ul = document.querySelector('ul');

  ipcRenderer.on('item:add', function(e, item){
  alert(item);
  });*/


/****************************\
 ============================
 
         MAIN DRIVER

 ============================              
\****************************/

// chess board configuration
var config = {
  draggable: true,
  pieceTheme: '../libs/xiangqiboardjs-0.3.3/img/xiangqipieces/traditional/{piece}.png',
  position: 'start', //'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RNBAKABNR b',
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

// create chess board widget instance
var board = Xiangqiboard('xiangqiboard', config);

// create WukongJS engine instance
const engine = new Engine();

// init starting position
engine.setBoard(engine.START_FEN);


