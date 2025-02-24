import type { AIBaseMessage, AIMessage } from '../types'
import { ollama } from './ai'

export const runLLM = async ({ messages }: { messages: AIBaseMessage[] }) => {
  const resp = await ollama.chat({
    model: 'llama3.1',
    messages,
  })

  return resp.message.content
}
