/****************************\
 ============================
 
      USER INPUT HANDLERS

 ============================              
\****************************/


/* handle new game button click
$('#newgame').on('click', function() {
  // reset engine
  engine.setBoard(engine.START_FEN);
  
  // set initial board position
  board.position('start');
});

// handle make move button click
$('#makemove').on('click', function() {
  // make computer move
  makeMove();
});

// handle take back button click
$('#takeback').on('click', function() {
  // take move back
  engine.takeBack();
  
  // update board position
  board.position(engine.generateFen());
});

// handle flip board button click
$('#flipboard').on('click', function() {
  // flip board
  board.flip();
});

// handle select move time option
$('#move_time').on('change', function() {
  // disable fixed depth
  $('#fixed_depth').val('0');
});

// handle select fixed depth option
$('#fixed_depth').on('change', function() {
  // disable fixed depth
  $('#move_time').val('0');
});

// handle set FEN button click
$('#set_fen').on('click', function() {
  // set user FEN
  
  // FEN parsed
  if (game.load($('#fen').val()))
    // set board position
    board.position(game.fen());
  
  // FEN is not parsed
  else
    alert('Illegal FEN!');
});

// prevent scrolling on touch devices
$('#chessboard').on('scroll touchmove touchend touchstart contextmenu', function(e) {
  e.preventDefault();
});*/


/****************************\
 ============================
 
    USER CONTROL FUNCTIONS
  
 ============================              
\****************************/

// make engine move
function makeMove() {
  // make computer move
  setTimeout(function() {
    let bestMove = engine.searchTime(1000); // search for 1 second
    engine.makeMove(bestMove);
    let fen = engine.generateFen();
    board.position(fen);
  }, 300);
}

// on dropping piece
function onDrop (source, target) {
  let move = source + target;
  console.log(source + target);
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
}

// create chess board widget instance
var board = Xiangqiboard('xiangqiboard', config)

// create WukongJS engine instance
const engine = new Engine();

// init starting position
engine.setBoard(engine.START_FEN);


