import { ElectronAPI } from '@electron-toolkit/preload'
import { IClient } from 'interfaces/Client'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ICustomAPI
  }
}

interface ICustomAPI {
  listClients: () => IClient[]
  createClient: (first: string, last?: string, email?: string) => void
  getClient: (id: number) => IClient
}
