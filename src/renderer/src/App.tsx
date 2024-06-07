/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom'
import { MouseEventHandler } from 'react'
import { Button } from './components/ui/button'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const navigate = useNavigate()

  // const listClients = async (): Promise<object> => {
  //   console.log(window.api)
  //   return await window.api.listClients()
  // }

  // const createClient = async (): Promise<void> => await window.api.createClient('kevin')
  const navigateClients: MouseEventHandler<HTMLButtonElement> = () => navigate('/clients')

  return (
    <div className="flex h-dvh justify-center bg-gradient-to-b from-white to-slate-500 p-8">
      <Button onClick={navigateClients}>Clients</Button>
    </div>
  )
}

export default App
