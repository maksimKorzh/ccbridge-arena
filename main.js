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
          accelerator: 'Ctrl+D',
          label: 'Debug engine',
          click() {
            createEngineDebugWindow();
          }
        },
        {
          accelerator: 'Ctrl+E',
          label: 'Human vs Engine',
          click() {
            createPlayEngineWindow();
          }
        },
        {
          accelerator: 'Ctrl+M',
          label: 'Engine vs Engine',
          click() {
            createEngineMatchWindow();
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

// window instances
let engineDebugWindow = null;
let playEngineWindow = null;
let engineMatchWindow = null;

// debug engine
function createEngineDebugWindow() {
  if (engineDebugWindow == null) { 
    // create new window
    engineDebugWindow = new BrowserWindow({
      show: false,
      resizable: false,
      width: 391,
      height: 486,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // load URL into window
    engineDebugWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'views/engine_debug.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    // to look more like desktop app
    engineDebugWindow.webContents.on('did-finish-load', function() {
      engineDebugWindow.show();
    });
    
    // garbage collection handle
    engineDebugWindow.on('close', function() {
      engineDebugWindow = null;
    });
    
    // don't show menu
    engineDebugWindow.setMenu(null)
  }
}

// play with engine
function createPlayEngineWindow() {
  if (playEngineWindow == null) { 
    // create new window
    playEngineWindow = new BrowserWindow({
      show: false,
      resizable: false,
      width: 391,
      height: 486,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // load URL into window
    playEngineWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'views/engine_play.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    // to look more like desktop app
    playEngineWindow.webContents.on('did-finish-load', function() {
      playEngineWindow.show();
    });
    
    // garbage collection handle
    playEngineWindow.on('close', function() {
      playEngineWindow = null;
    });
    
    // don't show menu
    playEngineWindow.setMenu(null)
  }
}

// engine match
function createEngineMatchWindow() {
  if (engineMatchWindow == null) { 
    // create new window
    engineMatchWindow = new BrowserWindow({
      show: false,
      resizable: false,
      width: 391,
      height: 486,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // load URL into window
    engineMatchWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'views/engine_match.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    // to look more like desktop app
    engineMatchWindow.webContents.on('did-finish-load', function() {
      engineMatchWindow.show();
    });
    
    // garbage collection handle
    engineMatchWindow.on('close', function() {
      engineMatchWindow = null;
    });
    
    // don't show menu
    engineMatchWindow.setMenu(null)
  }
}


/****************************\
 ============================
 
     WINDOW COMMUNICATIONS

 ============================              
\****************************/

// listen to best move from engine
ipcMain.on('bestmove', function(e, bestMove){
  gameEditor.webContents.send('bestmove', bestMove);
});

// listen to GUI move
ipcMain.on('guifen', function(e, guiFen) {
  // send to all windows
  if (engineDebugWindow) engineDebugWindow.webContents.send('guifen', guiFen);
  if (playEngineWindow) playEngineWindow.webContents.send('guifen', guiFen);
});






