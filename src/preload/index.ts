import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { IPC_CHANNELS, type DesktopOrganizerAPI } from '../shared/ipc'

const api: DesktopOrganizerAPI = {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  launchApp: (path) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_APP, path),
  setWallpaper: (path) => ipcRenderer.invoke(IPC_CHANNELS.SET_WALLPAPER, path),
  getFileIcon: (path) => ipcRenderer.invoke(IPC_CHANNELS.GET_FILE_ICON, path),
  saveLayout: (data) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_LAYOUT, data),
  loadLayout: () => ipcRenderer.invoke(IPC_CHANNELS.LOAD_LAYOUT),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error exposed for non-isolated fallback
  window.api = api
}
