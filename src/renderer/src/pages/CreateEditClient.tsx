import { IClient } from 'interfaces/Client'
import { MouseEventHandler, useEffect, useState } from 'react'
import { Form, useForm } from 'react-hook-form'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormControl, FormField, FormItem, FormLabel } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { getClient } from 'db/clientManager'
const formSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional()
})

const CreateEditClient = (): JSX.Element => {
  const { id } = useParams() // Fetch user..
  const [client, setClient] = useState<IClient | undefined>(undefined)
  const navigate: NavigateFunction = useNavigate()
  const handleNavigateHome: MouseEventHandler<HTMLButtonElement> = () => navigate('/')

  useEffect(() => {
    if (id) setClient(getClient(Number(id)))
  }, [id])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: client ? client.first_name : '',
      last_name: client ? client.last_name : '',
      email: client ? client.email : '',
      address: client ? client.address : '',
      zip: client ? client.zip : '',
      company: client ? client.company : '',
      city: client ? client.city : '',
      state: client ? client.state : '',
      phone: client ? client.phone : ''
    }
  })

  const onSubmit = async (values: IClient): Promise<void> => {
    //...
    console.log(values)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

export default CreateEditClient
