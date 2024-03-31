import { TextInput } from '@mantine/core'
import { UseFormReturnType, useForm } from '@mantine/form'
import { IClient } from 'interfaces/Client'

const CreateEditClient = (client?: IClient): JSX.Element => {
  const form: UseFormReturnType<IClient> = useForm({
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
      // Add validation
    }
  })
  const handleSubmit = async (values: IClient): Promise<void> => {
    // Submit API call
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput withAsterisk label="First name" />
      </form>
    </>
  )
}

export default CreateEditClient
