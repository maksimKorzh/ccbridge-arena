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
    width: 447,
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
    
    // Open the DevTools.
    //gameEditor.webContents.openDevTools()
  });
  
  // quit app when closed
  gameEditor.on('closed', function() {
    app.quit();
  });
  
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});


/****************************\
 ============================
 
        ENGINE WINDOW

 ============================              
\****************************/

// window instances
let engineWindow1 = null;
let engineWindow2 = null;

// play with engines
function createEngineWindow1() {
  if (engineWindow1 == null) {
    // create new window
    engineWindow1 = new BrowserWindow({
      show: false,
      resizable: false,
      width: 391,
      height: 588,
      title: 'Engine 1',
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // load URL into window
    engineWindow1.loadURL(url.format({
      pathname: path.join(__dirname, 'views/engine_play.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    // to look more like desktop app
    engineWindow1.webContents.on('did-finish-load', function() {
      engineWindow1.show();
    });
    
    // garbage collection handle
    engineWindow1.on('close', function() {
      engineWindow1 = null;
    });
    
    // Insert menu
    engineWindow1.setMenu(null);
  }
}

// play with engines
function createEngineWindow2() {
  if (engineWindow2 == null) {
    // create new window
    engineWindow2 = new BrowserWindow({
      show: false,
      resizable: false,
      width: 391,
      height: 588,
      title: 'Engine 2',
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // load URL into window
    engineWindow2.loadURL(url.format({
      pathname: path.join(__dirname, 'views/engine_play.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    // to look more like desktop app
    engineWindow2.webContents.on('did-finish-load', function() {
      engineWindow2.show();
    });
    
    // garbage collection handle
    engineWindow2.on('close', function() {
      engineWindow2 = null;
    });
    
    // Insert menu
    engineWindow2.setMenu(null);
  }
}


/****************************\
 ============================
 
    WINDOW MENU TEMPLATES

 ============================              
\****************************/

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New game',
        click() { gameEditor.webContents.send('newgame'); }
      },
      {
        label: 'Open game',
        click() { gameEditor.webContents.send('opengame'); }
      },
      {
        label: 'Save game',
        click() { gameEditor.webContents.send('savegame'); }
      }
    ]
  },
  {
    label: 'Engine',
    submenu: [
      {
        label: 'Load engine 1',
        click() { createEngineWindow1(); }
      },
      {
        label: 'Load engine 2',
        click() { createEngineWindow2(); }
      }
    ]
  },
  {
    label: 'Movelist',
    click() { gameEditor.webContents.send('movelist'); }
  }
];


/****************************\
 ============================
 
     WINDOW COMMUNICATIONS

 ============================              
\****************************/

// listen to create engine window request
ipcMain.on('engine1', function() {
  createEngineWindow1();
});

// listen to create engine window request
ipcMain.on('engine2', function() {
  createEngineWindow2();
});

// listen to best move from engine
ipcMain.on('bestmove', function(e, bestMove){
  gameEditor.webContents.send('bestmove', bestMove);
});

// listen to GUI move
ipcMain.on('guifen', function(e, guiFen) {
  if (engineWindow1) engineWindow1.webContents.send('guifen', guiFen);
  if (engineWindow2) engineWindow2.webContents.send('guifen', guiFen);
});


