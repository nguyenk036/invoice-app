import { Button, TextInput } from '@mantine/core'
import { UseFormReturnType, useForm } from '@mantine/form'
import { IClient } from 'interfaces/Client'
import { MouseEventHandler } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'

interface IProps {
  client?: IClient
}

const CreateEditClient = (props: IProps): JSX.Element => {
  const { client } = props
  const navigate: NavigateFunction = useNavigate()
  const handleNavigateHome: MouseEventHandler<HTMLButtonElement> = () => navigate('/')

  const form: UseFormReturnType<IClient> = useForm<IClient>({
    initialValues: {
      first: client?.first ?? '',
      last: client?.last ?? '',
      email: client?.email ?? '',
      address: client?.address ?? '',
      zip: client?.zip ?? '',
      company: client?.company ?? '',
      city: client?.city ?? '',
      state: client?.state ?? '',
      phone: client?.phone ?? ''
    },
    validate: {
      first: (v) => (v.length < 1 ? 'First name must be at least one character.' : null),
      last: (v) => (v.length < 1 ? 'Last name must be at least one character.' : null)
    }
  })
  const handleSubmit = async (values: IClient): Promise<void> => {
    console.log(values)
    form.validate()
  }

  return (
    <>
      <Button onClick={handleNavigateHome} variant="gradient">
        Back
      </Button>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {Object.keys(form.values).map((key: string) => (
          <TextInput
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            {...form.getInputProps(key)}
            key={key}
            withAsterisk={['first', 'last'].includes(key)}
            m="sm"
          />
        ))}

        <Button type="submit" variant="gradient">
          Submit
        </Button>
      </form>
    </>
  )
}

export default CreateEditClient
