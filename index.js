const { app, BrowserWindow, ipcMain } = require('electron');
const { createDatabaseConnection, postgresClient } = require('./db');


let mainWindow;
let secondFrame;


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  



  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });



}


function createFrame() {
  secondFrame = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });



  secondFrame.loadFile('about.html');

  secondFrame.on('closed', function () {
    secondFrame = null;
  });
}

app.on('ready', async () => {
  await createDatabaseConnection();
  createWindow();
  //createFrame();

  try {
    const result = await postgresClient.query('SELECT * FROM todolist ORDER BY todoid ASC');
    const resultRows = result.rows;

    mainWindow.webContents.send('awake', resultRows);
    
  } catch (error) {
    console.error('Error querying the database:', error);
  }
});



app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('deneme', () => {
  console.log('testttt');
});

async function retrieve(){
  const result = await postgresClient.query('SELECT * FROM todolist');
  console.log(result.rows);
}
ipcMain.on('checkbox', (event, isChecked) => {
  console.log(isChecked);
  retrieve();
  
});


