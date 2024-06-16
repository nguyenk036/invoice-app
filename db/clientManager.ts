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

export const createClient = (first: string, last: string, email: string): void => {
  const query: string = `INSERT INTO Client
  ("first", "last", email, address, zip, company, city, state, phone)
  VALUES('', '', '', '', '', '', '', '', '');`
  db.exec(query)
}

export const getClient = (id: number) => {
  const query: string = `SELECT * FROM Client WHERE id = ${id};`
  const statement: Statement = db.prepare(query)
  const response = statement.get() as IClient
  return response
}
