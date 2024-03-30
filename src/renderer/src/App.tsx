/* eslint-disable @typescript-eslint/no-unused-vars */
import electronLogo from './assets/electron.svg'
import '@mantine/core/styles.css'
import { Button, MantineProvider, Title } from '@mantine/core'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const listClients = async (): Promise<object> => {
    console.log(window.db)
    return await window.db.listClients()
  }

  const createClient = async () => await window.db.createClient('Kevin', 'N', `test`)

  return (
    <MantineProvider>
      <Title>Invoice App</Title>
      <img alt="logo" className="logo" src={electronLogo} />
      <Button onClick={listClients}>Get Clients</Button>
      <Button onClick={createClient}>Create Test Client</Button>
    </MantineProvider>
  )
}

export default App
