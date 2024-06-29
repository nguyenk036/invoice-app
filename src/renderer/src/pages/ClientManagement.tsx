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
        className="absolute w-10 h-10 font-bold rounded-full bg-primary text-primary-foreground"
        onClick={handleNavigateHome}
      >
        &larr;
      </button>
      <div className="w-full text-3xl text-center text-slate-500">Client Management</div>
      <div>
        {clients.map((client, i) => (
          <div key={i}>{client.first_name.charAt(0)}</div>
        ))}
      </div>
      <Button onClick={handleNavigateCreateEdit}>Create new client</Button>
    </div>
  )
}

export default ClientManagement
