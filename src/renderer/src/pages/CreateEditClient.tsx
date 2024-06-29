import { IClient } from 'interfaces/Client'
import { MouseEventHandler, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useForm } from 'react-hook-form'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardTitle } from '@renderer/components/ui/card'

const formSchema = z.object({
  first_name: z.string().min(2, 'First name should be at least two characters.'),
  last_name: z.string().optional(),
  email: z.union([z.string().email('Invalid email format.'), z.literal('')]),
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
    await window.api.createClient(values)
    console.log(values)
  }

  return (
    <div className="flex flex-col justify-center h-[calc(100dvh-75px)] items-center">
      <Card className="w-[65dvw] min-w-[400px]">
        <CardTitle className="flex justify-center m-8">
          <div className="self-center">Register a new client</div>
        </CardTitle>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col" id="register">
              <div className="">
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
              </div>
            </form>
            <div className="my-3">
              <Button type="submit" form="register" className="w-full my-3">
                Submit
              </Button>
              <Button className="w-full" onClick={handleNavigateClients}>
                Cancel
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateEditClient
