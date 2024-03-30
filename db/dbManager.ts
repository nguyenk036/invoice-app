import { Database } from 'better-sqlite3'

const sqlite = require('better-sqlite3')

export const db: Database = new sqlite('db/local.db')
