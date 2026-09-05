import type { DesktopOrganizerAPI } from '../shared/ipc'

declare global {
  interface Window {
    api: DesktopOrganizerAPI
  }
}

export {}
