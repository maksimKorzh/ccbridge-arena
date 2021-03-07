/****************************\
 ============================
 
         CCBRIDGE JS

 ============================              
\****************************/


// import packages
const electron = require('electron');
const url = require('url');
const path = require('path');

// app
const {app, BrowserWindow, Menu, ipcMain} = electron;


/****************************\
 ============================
 
          GAME EDITOR

 ============================              
\****************************/

// main window
let gameEditor;

// Listen for app ready
app.on('ready', function() {
  // create new window
  gameEditor = new BrowserWindow({
    show: false,
    resizable: false,
    width: 844,
    height: 564,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // load URL into window
  gameEditor.loadURL(url.format({
    pathname: path.join(__dirname, 'views/game_editor.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // to look more like desktop app
  gameEditor.webContents.on('did-finish-load', function() {
    gameEditor.show();
  });
  
  // quit app when closed
  gameEditor.on('closed', function() {
    app.quit();
  });
  
  // build menu from template
  const mainMenu = Menu.buildFromTemplate([
    {
      label: 'Engine',
      submenu: [
        {
          label: 'Load new engine',
          click() {
            createEngineWindow();
          }
        }
      ]
    },
    {
      accelerator: 'Ctrl+Shift+I',
      label: 'DevTools',
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    },
    {
      role: 'reload'
    }
  ]);
  
  // insert menu
  Menu.setApplicationMenu(mainMenu);
});


/****************************\
 ============================
 
        ENGINE WINDOWS

 ============================              
\****************************/

function createEngineWindow() {
  // destroy previous window if any
  engineWindow = null;
  
  // create new window
  engineWindow = new BrowserWindow({
    show: false,
    resizable: false,
    width: 300,
    height: 400,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // load URL into window
  engineWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/engine.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // to look more like desktop app
  engineWindow.webContents.on('did-finish-load', function() {
    engineWindow.show();
  });
  
  // garbage collection handle
  engineWindow.on('close', function() {
    engineWindow = null;
  });
  
  // don't show menu
  engineWindow.setMenu(null)
}


/****************************\
 ============================
 
     WINDOW COMMUNICATIONS

 ============================              
\****************************/

// catch item:add
ipcMain.on('bestmove', function(e, bestMove){
  gameEditor.webContents.send('bestmove', bestMove);
  //engineWindow.close(); 
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //engineWindow = null;
});


