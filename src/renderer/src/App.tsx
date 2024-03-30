/* eslint-disable @typescript-eslint/no-unused-vars */
import electronLogo from './assets/electron.svg'
import '@mantine/core/styles.css'
import { Button, MantineProvider } from '@mantine/core'
import { redirect, useNavigate } from 'react-router-dom'
import { MouseEventHandler } from 'react'

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
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <Button variant="gradient" onClick={navigateClients}>
        Clients
      </Button>
    </>
  )
}

export default App
