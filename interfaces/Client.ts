import { Base } from './BaseDB'

export interface IClient extends Partial<Base> {
  first_name: string
  last_name?: string
  email?: string
  address?: string
  zip?: string
  company?: string
  city?: string
  state?: string
  phone?: string
}
