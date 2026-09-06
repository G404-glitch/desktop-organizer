import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'

const isDev = !app.isPackaged
const MIN_WIDTH = 640
const MIN_HEIGHT = 480

let mainWindowRef: BrowserWindow | null = null
let detachFn: ((win: BrowserWindow) => void) | null = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registerIpcHandlers(mainWindow)

  // keep a reference for attach/detach cleanup
  mainWindowRef = mainWindow

  mainWindow.on('ready-to-show', async () => {
    mainWindow.show()
    try {
      // Use runtime require via eval to avoid bundlers trying to resolve this
      // dependency during build. This keeps the package optional at build-time.
      // eslint-disable-next-line no-eval
      const _require: NodeRequire = eval('require')
      const mod = _require('electron-as-wallpaper')
      if (mod && mod.attach) {
        try {
          mod.attach(mainWindow, {
            transparent: true,
            forwardKeyboardInput: true,
            forwardMouseInput: true,
          })
          if (mod.detach) detachFn = mod.detach
        } catch (err) {
          console.error('Failed to attach mainWindow as wallpaper:', err)
        }
      }
    } catch (err) {
      console.error('electron-as-wallpaper not available (wallpaper pinning disabled):', err)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.desktop-organizer')
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (mainWindowRef) {
      try {
        if (detachFn) detachFn(mainWindowRef)
      } catch (err) {
        console.error('Failed to detach mainWindow during window-all-closed:', err)
      }
      mainWindowRef = null
    }
    app.quit()
  }
})

// Safety net: ensure detach is attempted before quitting the app
app.on('before-quit', () => {
  if (mainWindowRef) {
    try {
      if (detachFn) detachFn(mainWindowRef)
    } catch (err) {
      console.error('Failed to detach mainWindow during before-quit:', err)
    }
    mainWindowRef = null
  }
})
