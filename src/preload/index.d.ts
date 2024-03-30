import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ICustomAPI
  }
}

interface ICustomAPI {
  listClients: function
  createClient: (first: string, last?: string, email?: string) => void
}
