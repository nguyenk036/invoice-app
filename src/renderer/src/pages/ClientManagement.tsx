import { Avatar, Button, Grid, Title, Tooltip } from '@mantine/core'
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
      <Title>Client Management</Title>
      <Button onClick={navigateHome}>Back</Button>
      <Grid my="lg">
        {clients.map((client) => (
          <Grid.Col span={4} key={client.firstName}>
            <Tooltip label={`${client.firstName} ${client.lastName}`} withArrow>
              <Avatar src={null} m="md" size="lg">
                {client.firstName.charAt(0)}
              </Avatar>
            </Tooltip>
          </Grid.Col>
        ))}
      </Grid>
    </>
  )
}

export default ClientManagement
