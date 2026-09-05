import { ipcMain } from 'electron'
import {
  IPC_CHANNELS,
  type GetFileIconResult,
  type LaunchAppResult,
  type LoadLayoutResult,
  type SaveLayoutResult,
  type SetWallpaperResult
} from '../shared/ipc'

export function registerIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.LAUNCH_APP,
    async (_event, filePath: string): Promise<LaunchAppResult> => {
      console.log('[stub] launchApp:', filePath)
      return { success: true }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SET_WALLPAPER,
    async (_event, filePath: string): Promise<SetWallpaperResult> => {
      console.log('[stub] setWallpaper:', filePath)
      return { success: true }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GET_FILE_ICON,
    async (_event, filePath: string): Promise<GetFileIconResult> => {
      console.log('[stub] getFileIcon:', filePath)
      return {
        dataUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SAVE_LAYOUT,
    async (_event, data: unknown): Promise<SaveLayoutResult> => {
      console.log('[stub] saveLayout:', data)
      return { success: true }
    }
  )

  ipcMain.handle(IPC_CHANNELS.LOAD_LAYOUT, async (): Promise<LoadLayoutResult> => {
    console.log('[stub] loadLayout')
    return { data: null }
  })
}
