import { JSONFilePreset } from 'lowdb/node'
import type { AIMessage, AIBaseMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const addMetadata = (message: AIBaseMessage): AIMessage => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

export const removeMetadata = (message: AIMessage): AIBaseMessage => {
  const { id, createdAt, ...restOfMessage } = message

  return restOfMessage
}

type DbData = {
  messages: AIMessage[]
}

const defaultData: DbData = { messages: [] }

export const getDB = async () => {
  const db = await JSONFilePreset<DbData>('db.json', defaultData)

  return db
}

export const addMessages = async (messages: AIBaseMessage[]) => {
  const db = await getDB()

  db.data.messages.push(...messages.map(addMetadata))

  await db.write()
}

export const getMessages = async () => {
  const db = await getDB()

  return db.data.messages.map(removeMetadata)
}
