export const IPC_CHANNELS = {
  LAUNCH_APP: 'launch-app',
  SET_WALLPAPER: 'set-wallpaper',
  GET_FILE_ICON: 'get-file-icon',
  SAVE_LAYOUT: 'save-layout',
  LOAD_LAYOUT: 'load-layout',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window'
} as const

export type LaunchAppResult = { success: boolean; error?: string }
export type SetWallpaperResult = { success: boolean; error?: string }
export type GetFileIconResult = { dataUrl: string }
export type SaveLayoutResult = { success: boolean }
export type LoadLayoutResult = { data: unknown | null }

export interface DesktopOrganizerAPI {
  getPathForFile: (file: File) => string
  launchApp: (path: string) => Promise<LaunchAppResult>
  setWallpaper: (path: string) => Promise<SetWallpaperResult>
  getFileIcon: (path: string) => Promise<GetFileIconResult>
  saveLayout: (data: unknown) => Promise<SaveLayoutResult>
  loadLayout: () => Promise<LoadLayoutResult>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}
