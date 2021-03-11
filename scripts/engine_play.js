/****************************\
 ============================
 
      PLAY VERSUS ENGINE

 ============================              
\****************************/

// packages
const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const dialog = electron.remote.dialog;

// define engine process
var engineProcess = null;

// load engine
function loadEngine() {
  dialog.showOpenDialog({ 
    title: 'Load engine', 
    defaultPath: path.join(__dirname, '../engines'), 
    buttonLabel: 'Load'
  }).then((file) => {
    if (!file.canceled) {
      fs.readFile(file.filePaths[0], 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }

        // talk to engine
        communicate(file.filePaths[0]);
      });
    }
  }).catch(err => {
    alert('Internal error: ' + err);
    console.log(err) 
  });
}

//communicate with engine
function communicate(enginePath) {
  // start engine process
  engineProcess = execFile(enginePath);
  document.title += ' ' + enginePath.split('engines/')[1].replace('linux/', '').replace('windows/', '').split('/')[0] + ' is loaded';

  // set xiangqi variant and UCCI protocol for fairy stockfish
  if (document.title.includes('Fairy')) {
    engineProcess.stdin.write('ucci\n')
    engineProcess.stdin.write('position fen rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1\n')
  } else { // init UCI engine
    engineProcess.stdin.write('uci\n');
    engineProcess.stdin.write('ucinewgame\n');
  }
  
  // listen to engine output
  engineProcess.stdout.on('data', (data) => {
    const output = document.getElementById('output');
    output.value += 'Engine to GUI: ' + data;
    output.scrollTop = output.scrollHeight;
    
    // send move to board window
    if (data.includes('bestmove'))
      setTimeout(function() {
        ipcRenderer.send('bestmove', data.split('bestmove ')[1].split(' ')[0]);
      }, (fixedTime ? 0 : 500));
  });

  // listen to engine process error
  engineProcess.stderr.on('data', (data) => {
    const output = document.getElementById('output');
    output.value += data;
    output.scrollTop = output.scrollHeight;
  });

  // listen to engine process exit
  engineProcess.on('close', (code) => {
    alert(`Engine process exited with code ${code}`);
  });

  // listen to GUI move
  ipcRenderer.on('guifen', function(e, fen) {
    var fen = fen.split('E').join('B').split('H').join('N').split('e').join('b').split('h').join('n');
    if (fen.includes('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1')) {
      engineProcess.stdin.write('ucinewgame\n');
      
      const output = document.getElementById('output');
      output.value += 'ucinewgame\n';
      output.scrollTop = output.scrollHeight;
    }

    engineProcess.stdin.write('position fen ' + fen + '\n');
    
    const output = document.getElementById('output');
    output.value += 'GUI to engine: ' + 'position fen ' + fen + '\n';
    output.scrollTop = output.scrollHeight;
    
    // search
    makeMove(fen);
  });
}

// make engine move
function makeMove(fen) {
  var fenSide = -1;
  if (fen.length > 1) {
    fenSide = (fen.split(' ')[1].split(' ')[0] == 'b' ? 1 : 0);
    if (engineSide == fenSide) search();
  } else if (fen == '') search();
}

// start searching
function search() {
  if (fixedDepth) {
    engineProcess.stdin.write('go depth ' + fixedDepth + '\n');
    
    const output = document.getElementById('output');
    output.value += 'GUI to engine: ' + 'go depth ' + fixedDepth + '\n';
    output.scrollTop = output.scrollHeight;
  } else if (fixedTime) {
    engineProcess.stdin.write('go movetime ' + (fixedTime * 1000) + '\n');
    
    const output = document.getElementById('output');
    output.value += 'GUI to engine: ' + 'go movetime ' + (fixedTime * 1000) + '\n';
    output.scrollTop = output.scrollHeight;
  }
}


/****************************\
 ============================
 
      DIFFICULTY LEVELS

 ============================              
\****************************/

var engineSide = 2;
var fixedTime = 1;
var fixedDepth = 0;

// listen to change of search depth
$('#depth').on('change', function() {
  $('#time').val('0');
  fixedDepth = $('#depth').val();
  fixedTime = 0;
});

// listen to change of search time
$('#time').on('change', function() {
  $('#depth').val('0');
  fixedTime = $('#time').val();
  fixedDepth = 0;
});

// listen to engine side change
$('#engineside').on('change', function() {
  engineSide = parseInt($('#engineside').val());
});










