import type { Tool } from 'ollama'
import type { AIBaseMessage, AIMessage } from '../types'
import { ollama } from './ai'
import systemPrompt from './config/systemPrompt'

type OllamaModelNames =
  | 'llama3.1'
  | 'llama3.1:70b'
  | 'deepseek-v2:latest'
  | 'llama3.3:latest'

export const runLLM = async ({
  messages,
  tools,
  model = 'llama3.1',
}: {
  messages: AIBaseMessage[]
  tools: Tool[]
  model?: OllamaModelNames
}) => {
  const resp = await ollama.chat({
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    tools,
  })

  return resp
}
