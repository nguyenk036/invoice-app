/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom'
import { MouseEventHandler } from 'react'
import { Card, CardContent, CardHeader } from './components/ui/card'

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
    <div className="flex flex-col justify-center h-full">
      <div className="flex justify-center gap-3">
        <button onClick={navigateClients}>
          <Card className="flex flex-col justify-between duration-500 ease-in-out border-none hover:shadow-lg hover:opacity-80 bg-gradient-to-br from-blue-500 to-zinc-400 w-[300px] h-[300px] text-white">
            <CardHeader className="text-3xl font-bold text-left">CLIENTS</CardHeader>
            <CardContent>Manage your clients' information</CardContent>
          </Card>
        </button>
        <div className="flex flex-col gap-3">
          <button>
            <Card className="flex flex-col justify-between duration-500 ease-in-out border-none hover:shadow-lg hover:opacity-80 bg-gradient-to-br from-green-400 to-slate-400 w-[200px] h-[188px] text-white">
              <CardHeader className="text-3xl font-bold text-left">CREATE</CardHeader>
              <CardContent className="text-left">Create an invoice for a client</CardContent>
            </Card>
          </button>
          <button>
            <Card className="flex flex-col justify-between duration-500 ease-in-out border-none hover:shadow-lg hover:opacity-80 bg-gradient-to-br from-amber-400 to-zinc-400 w-[200px] h-[100px] text-white">
              <CardHeader className="text-3xl font-bold text-left">SETTINGS</CardHeader>
            </Card>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
