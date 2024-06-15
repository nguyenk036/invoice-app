import { Base } from './BaseDB'

export interface IInvoiceItem extends Partial<Base> {
  name: string
  rate: number
}
