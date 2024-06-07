import { IClient } from 'interfaces/Client'
import { MouseEventHandler, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ClientManagement = (): JSX.Element => {
  const [clients, setClients] = useState<IClient[]>([])
  const navigate = useNavigate()
  const navigateHome: MouseEventHandler<HTMLButtonElement> = () => navigate('/')
  const fetchClients = async (): Promise<void> => setClients(await window.api.listClients())

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <>
      <div>Client Management</div>
      <button onClick={navigateHome}>Back</button>
      <div>
        {clients.map((client, i) => (
          <div key={i}>{client.first.charAt(0)}</div>
        ))}
      </div>
    </>
  )
}

export default ClientManagement
