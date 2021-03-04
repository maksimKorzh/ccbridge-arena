// import packages
const electron = require('electron');
const url = require('url');
const path = require('path');

// set environment
process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'production';

// app
const {app, BrowserWindow, Menu, ipcMain} = electron;

// main window
let mainWindow;

// Listen for app ready
app.on('ready', function() {
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // load URL into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // quit app when closed
  mainWindow.on('closed', function() {
    app.quit();
  });
  
  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // insert menu
  Menu.setApplicationMenu(mainMenu);
});

// catch item:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  testWindow.close(); 
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  testWindow = null;
});

function createTestWindow() {
  // create new window
  testWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'test window',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // load URL into window
  testWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/testWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // garbage collection handle
  testWindow.on('close', function() {
    testWindow = null;
  });
}

// create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New window',
        click() {
          createTestWindow();
        }
      },
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// add developer tools to menu if not in production
if (process.env.NODE_ENV != 'production') {
  mainMenuTemplate.push({
    accelerator: 'Ctrl+Shift+I',
    label: 'DevTools',
    click(item, focusedWindow) {
      focusedWindow.toggleDevTools();
    }
  },
  {
    role: 'reload'
  });
}



