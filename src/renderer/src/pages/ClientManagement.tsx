import { Button } from '@renderer/components/ui/button'
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
    <div>
      <Button className="absolute rounded-full" onClick={navigateHome}>
        &larr;
      </Button>
      <div className="w-full text-3xl text-center text-slate-500">Client Management</div>
      <div>
        {clients.map((client, i) => (
          <div key={i}>{client.first.charAt(0)}</div>
        ))}
      </div>
    </div>
  )
}

export default ClientManagement
