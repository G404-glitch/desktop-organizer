import { app, BrowserWindow, ipcMain, shell } from 'electron'
// Use require to handle CommonJS default export shape at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _StorePkg = require('electron-store') as any
const Store = _StorePkg.default ?? _StorePkg
import { setWallpaper } from 'wallpaper'


import {
  IPC_CHANNELS,
  type GetFileIconResult,
  type LaunchAppResult,
  type LoadLayoutResult,
  type SaveLayoutResult,
  type SetWallpaperResult
} from '../shared/ipc'

const store = new Store() as any

const fallbackIconDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

export function registerIpcHandlers(win: BrowserWindow): void {
  ipcMain.handle(
    IPC_CHANNELS.LAUNCH_APP,
    async (_event, filePath: string): Promise<LaunchAppResult> => {
      const result = await shell.openPath(filePath)

      if (result === '') {
        return { success: true }
      }

      return { success: false, error: result }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SET_WALLPAPER,
    async (_event, filePath: string): Promise<SetWallpaperResult> => {
      try {
        await setWallpaper(filePath)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GET_FILE_ICON,
    async (_event, filePath: string): Promise<GetFileIconResult> => {
      try {
        const nativeImg = await app.getFileIcon(filePath, { size: 'normal' })
        if (nativeImg && typeof nativeImg.toDataURL === 'function') {
          const dataUrl = nativeImg.toDataURL()
          if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
            return { dataUrl }
          }
        }

        return { dataUrl: fallbackIconDataUrl }
      } catch (err) {
        return { dataUrl: fallbackIconDataUrl }
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SAVE_LAYOUT,
    async (_event, data: unknown): Promise<SaveLayoutResult> => {
      store.set('layout', data)
      return { success: true }
    }
  )

  ipcMain.handle(IPC_CHANNELS.LOAD_LAYOUT, async (): Promise<LoadLayoutResult> => {
    return { data: store.get('layout') ?? null }
  })

  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, async () => {
    win.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, async () => {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, async () => {
    win.close()
  })
}
