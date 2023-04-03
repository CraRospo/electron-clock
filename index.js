const {app, BrowserWindow, ipcMain, Notification} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '/assets/clock.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
}

// 显示通知
function createNotification(infos) {
  if (Notification.isSupported()) {
    const defaultOpt = {
      icon: path.join(__dirname, '/assets/clock.png')
    }
    const opt = Object.assign({}, defaultOpt, infos)
    const notification = new Notification(opt)
    notification.show()
    return
  }

  console.log('not support!')
}

app.whenReady().then(() => {
  createWindow()

  // 影响notification的title
  app.setAppUserModelId('clocker')
  
  // 监听通知
  ipcMain.on('notify', (e, infos) => {
    createNotification(infos)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})