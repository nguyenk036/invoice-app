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
      <Button variant="gradient" onClick={navigateHome}>
        Back
      </Button>
      <Button>Add Client</Button>
      <Grid my="lg">
        {clients.map((client) => (
          <Grid.Col span={4} key={client.first}>
            <Tooltip label={`${client.first} ${client.last}`} withArrow>
              <Avatar src={null} m="md" size="lg">
                {client.first.charAt(0)}
              </Avatar>
            </Tooltip>
          </Grid.Col>
        ))}
      </Grid>
    </>
  )
}

export default ClientManagement
