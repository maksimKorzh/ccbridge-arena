/****************************\
 ============================
 
    DEBUG EXTERNAL ENGINE

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
  document.title = 'Engine "' + enginePath.split('engines/')[1].replace('linux/', '').replace('windows/', '') + '" is loaded';

  // init engine
  engineProcess.stdin.write('uci\n');
  engineProcess.stdin.write('ucinewgame\n');

  // listen to engine output
  engineProcess.stdout.on('data', (data) => {
    const output = document.getElementById('output');
    output.value += 'Engine to GUI: ' + data;
    output.scrollTop = output.scrollHeight;
    
    // send move to board window
    if (data.includes('bestmove'))
      ipcRenderer.send('bestmove', data.split('bestmove ')[1].split(' ')[0]);
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
    fen = fen.split('E').join('B').split('H').join('N').split('e').join('b').split('h').join('n');
    engineProcess.stdin.write('position fen ' + fen + '\n');
    
    const output = document.getElementById('output');
    output.value += 'GUI to engine: ' + 'position fen ' + fen + '\n';
    output.scrollTop = output.scrollHeight;
  });
}

// send UCI command to engine process
function sendCommand() {
  engineProcess.stdin.write(document.getElementById('command').value + '\n');
  document.getElementById('command').value = '';
}

