import { ollama } from './ai'

export const runLLM = async ({ userMessage }: { userMessage: string }) => {
  const resp = await ollama.chat({
    model: 'llama3.1',
    messages: [{ role: 'user', content: userMessage }],
  })

  return resp.message.content
}
