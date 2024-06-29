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
  createClient: (client: IClient) => void
  getClient: (id: number) => IClient
}
