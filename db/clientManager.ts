import { Statement } from 'better-sqlite3'
import { IClient } from '../interfaces/Client'
import { db } from './dbManager'

export const listClients = (): IClient[] => {
  const query: string = 'SELECT * FROM Client'
  const statement: Statement = db.prepare(query)
  const response = statement.all() as IClient[]
  console.log(response)
  return response
}

export const createClient = (client: IClient): void => {
  const query: string = `INSERT INTO Client 
    VALUES (
    "${client.first_name}", 
    "${client.last_name}", 
    "${client.email}", 
    "${client.address}", 
    "${client.zip}", 
    "${client.company}", 
    "${client.city}", 
    "${client.state}", 
    "${client.phone}");`
  console.log(query)

  db.exec(query)
}

export const getClient = (id: number) => {
  const query: string = `SELECT * FROM Client WHERE id = ${id};`
  const statement: Statement = db.prepare(query)
  const response = statement.get() as IClient
  return response
}
