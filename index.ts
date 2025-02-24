import 'dotenv/config'
import { runLLM } from './src/llm'
import { addMessages, getMessages } from './src/memory'
import type { AIBaseMessage } from './types'
const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

const messages = await getMessages()

let newUserMessage = {
  role: 'user',
  content: userMessage,
}

const response = await runLLM({
  messages: [...messages, newUserMessage],
})

let newAssistantMessage = {
  role: 'assistant',
  content: response,
}

await addMessages([newUserMessage, newAssistantMessage])

console.log('response', response)
