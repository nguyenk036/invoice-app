import { Button } from '@renderer/components/ui/button'
import { IClient } from 'interfaces/Client'
import { MouseEventHandler, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ClientManagement = (): JSX.Element => {
  const [clients, setClients] = useState<IClient[]>([])
  const navigate = useNavigate()
  const handleNavigateHome: MouseEventHandler<HTMLButtonElement> = () => navigate('/')
  const handleNavigateCreateEdit: MouseEventHandler<HTMLButtonElement> = () =>
    navigate('/clients/create')
  const fetchClients = async (): Promise<void> => setClients(await window.api.listClients())

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <div>
      <button
        className="fontbo absolute h-10 w-10 rounded-full bg-primary text-primary-foreground"
        onClick={handleNavigateHome}
      >
        &larr;
      </button>
      <div className="w-full text-center text-3xl text-slate-500">Client Management</div>
      <div>
        {clients.map((client, i) => (
          <div key={i}>{client.first.charAt(0)}</div>
        ))}
      </div>
      <Button onClick={handleNavigateCreateEdit}>Create new client</Button>
    </div>
  )
}

export default ClientManagement
