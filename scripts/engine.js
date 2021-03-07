/****************************\
 ============================
 
     GAME ANALISIS MODULE

 ============================              
\****************************/

// packages
const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');


/****************************\
 ============================
 
   CONNECT EXTERNAL ENGINE

 ============================              
\****************************/

const enginePath = path.join(__dirname, '../engines/linux/chameleon');
const engineProcess = execFile(enginePath);

alert('Engine "' + enginePath.split('engines/')[1].replace('linux/', '').replace('windows/', '') + '" is loaded')

engineProcess.stdout.on('data', (data) => {
  const output = document.getElementById('output');
  output.value += data;
  output.scrollTop = output.scrollHeight;
  
  // send move to board window
  if (data.includes('bestmove'))
    ipcRenderer.send('bestmove', data.split('bestmove ')[1].split(' ')[0]);
});

engineProcess.stderr.on('data', (data) => {
  const output = document.getElementById('output');
  output.value += data;
  output.scrollTop = output.scrollHeight;
});

engineProcess.on('close', (code) => {
  alert(`Engine process exited with code ${code}`);
});

function sendCommand() {
  engineProcess.stdin.write(document.getElementById('command').value + '\n');
  document.getElementById('command').value = '';
}

/****************************\
 ============================
 
    ELECTRON COMMUNICATION

 ============================              
\****************************/

//document.querySelector('form').addEventListener('submit', submitForm);

function submitForm(e){
  e.preventDefault();
  const item = document.querySelector('#item').value;
  console.log(ipcRenderer);
  ipcRenderer.send('item:add', item);
}
