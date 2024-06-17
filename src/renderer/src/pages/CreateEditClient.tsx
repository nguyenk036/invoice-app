import { IClient } from 'interfaces/Client'
import { MouseEventHandler, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useForm } from 'react-hook-form'
import { Button } from '@renderer/components/ui/button'

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
  const handleNavigateClients: MouseEventHandler<HTMLButtonElement> = () => navigate('/clients')

  // useEffect(() => {
  //   if (id) setClient(window.api.getClient(Number(id)))
  // }, [id])

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
      <Button size="icon" onClick={handleNavigateClients}>
        &larr;
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
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
