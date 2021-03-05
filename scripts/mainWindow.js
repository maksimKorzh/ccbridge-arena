/****************************\
 ============================
 
      USER INPUT HANDLERS

 ============================              
\****************************/

// highlight move in move list
function highlightMove(move) {
  // reset highlighting
  document.getElementById('movelist').childNodes.forEach((item, index) => {
    try {
      if (index > 1) {
        item.classList.remove('bg-primary');
        item.classList.remove('text-white');
      }
    } catch(e) {}
  });

  // highlight move
  highlight = document.getElementById('UBB_move_' + move);
  highlight.classList.add('bg-primary');
  highlight.classList.add('text-white');
}

// highlight variation
function highlightVariation(variation) {
  // reset highlighting
  document.getElementById('variationlist').childNodes.forEach((item, index) => {
    try {
      if (index > 1) {
        item.classList.remove('bg-primary');
        item.classList.remove('text-white');
      }
    } catch(e) {}
  });

  // highlight move
  highlight = document.getElementById(variation);
  highlight.classList.add('bg-primary');
  highlight.classList.add('text-white');
}

// update board
function updateGUIboard(moveNumber, variationId) {
  if (moveNumber) {
    // update UBB board
    gotonum(moveNumber);
  } else {
    // parse agrs
    let args = variationId.toString().split('get_movetext(')[1].split(')')[0].split(',');
    
    // update UBB board
    get_movetext(args[0].split("'").join(''), args[1].split("'").join(''));
  }
  
  // get moves
  let currentMove = document.getElementById('shownow').value.split('/')[0];
  let lastMove = document.getElementById('shownow').value.split('/')[1];
  
  // get current FEN
  let UBBfen = getFENTEXT(P[currentMove]);
  
  // update engine board
  engine.setBoard(UBBfen);
  
  // update GUI board
  board.position(UBBfen);
  
  // current move to highlight
  updateGameTree();
  
  // play sound
  MOVE_SOUND.play()
}

// edit comment
function editComment() {
  document.getElementById('c_text').value = document.getElementById('comments').value;
  EditComment(cText);
}

// delete move/moves/variation
function deleteMove() {
  // delete on UBB board
  DelMove();
  clickYES();
  
  // click 'Yes' on delete error message
  setTimeout(() => {
    clickYES();
  }, 100);

  // get moves
  let currentMove = document.getElementById('shownow').value.split('/')[0];
  let lastMove = document.getElementById('shownow').value.split('/')[1];
  
  // get current FEN
  let UBBfen = getFENTEXT(P[currentMove]);
  
  // update engine board
  engine.setBoard(UBBfen);
  
  // update GUI board
  board.position(UBBfen);
  
  // current move to highlight
  updateGameTree();
}


/****************************\
 ============================
 
       DPXQ INTEGRATION
  
 ============================              
\****************************/

// add variation
function updateGameTree() {
  // reset move list
  let moveList = document.getElementById('movelist');
  moveList.innerHTML = `
    <li class="btn list-group-item bg-light m-0 p-0" style="font-size: 16px; font-weight: bold;">Move list</li>
    <li id="UBB_move_0" class="btn list-group-item list-group-item-action text-center m-0 p-0" onclick="updateGUIboard('First')">Start</li>
  `;
  
  // update move list
  document.getElementById('m_text').childNodes.forEach((item) => {
    if (item.tagName == 'DIV') {
      let moveNumber = parseInt(item.id.split('_')[1]);
      
      if (moveNumber) {
        let moveText = item.childNodes[1].parentNode.innerText;
        let moveItem = document.createElement('li');
        
        moveItem.id = 'UBB_move_' + moveNumber;
        moveItem.classList = 'btn list-group-item list-group-item-action m-0 p-0';
        moveItem.style = 'font-size: 16px';
        moveItem.textContent = moveText;
        moveItem.setAttribute('onclick', 'updateGUIboard(parseInt(this.id.split("move_")[1]))');
        moveList.appendChild(moveItem);
      }
      
      if (item.style.backgroundColor == 'rgb(49, 106, 197)') highlightMove(moveNumber);
    }
  });
  
  // reset variation list
  let variationList = document.getElementById('variationlist');
  variationList.innerHTML = '<li class="btn list-group-item bg-light m-0 p-0" style="font-size: 16px; font-weight: bold;">Variations</li>';
  
  // update variation list
  document.getElementById('v_text').childNodes.forEach((item) => {
    if (item.tagName == 'DIV') {
      let variationNumber = parseInt(item.id.split('_')[1]);
      let variationText = item.childNodes[1].innerText;
      let variationItem = document.createElement('li');
      let clickVariation = item.onclick.toString();
      
      variationItem.id = 'UBB_variation(' + item.id + ')';
      variationItem.classList = 'btn list-group-item list-group-item-action m-0 p-0';
      variationItem.style = 'font-size: 16px';
      variationItem.textContent = variationText;
      variationItem.setAttribute('onclick', 'updateGUIboard(0, ' + clickVariation + ');');
      variationList.appendChild(variationItem);
      
      if (item.style.backgroundColor == 'rgb(49, 106, 197)') highlightVariation(variationItem.id);
    }
  });
  
  // update comments
  document.getElementById('comments').value = document.getElementById('c_text').value.trim();
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
  
  // add variation (optional)
  if (document.getElementById('v_addnew').childNodes.length)
    if (document.getElementById('v_addnew').scrollWidth)
      document.getElementById('v_addnew').querySelector('a').click();
  
  // add move to move list
  setTimeout(() => {updateGameTree();}, 0);
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
  
  // play sound
  if (validMove) playSound(validMove);
}

// update the board position after the piece snap
function onSnapEnd () {
  board.position(engine.generateFen());
}

/****************************\
 ============================
 
         BOARD SOUNDS

 ============================              
\****************************/

// import sounds
const MOVE_SOUND = new Audio('../libs/xiangqiboardjs-0.3.3/sounds/move.wav');
const CAPTURE_SOUND = new Audio('../libs/xiangqiboardjs-0.3.3/sounds/capture.wav');

// play sound
function playSound(move) {
  if (engine.getCaptureFlag(move)) CAPTURE_SOUND.play();
  else MOVE_SOUND.play();
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


