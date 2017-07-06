const {app, BrowserWindow, Menu, globalShortcut} = require('electron')
const path = require('path')
const url = require('url')

let win = [];

function createWindow () {
  let newWin = new BrowserWindow({width: 800, height: 600})

  newWin.webContents.on('did-finish-load', ()=>{
    newWin.show();
    newWin.focus();
  });

//  newWin.webContents.on("devtools-opened", () => {
//    newWin.webContents.closeDevTools();
//  });
  
  newWin.loadURL(url.format({
    pathname: path.join(__dirname, 'client.html'),
    protocol: 'file:',
    slashes: true
  }));

  newWin.on('closed', () => {
    newWin = null
  })
  
  win.push(newWin)
}

app.on('ready', createWindow)
  
app.on('ready', () => {
  globalShortcut.register('CommandOrControl+N', () => {
    createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
