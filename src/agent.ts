import type { AIMessage } from '../types'
import { runLLM } from './llm'
import {
  addMessages,
  addMetadata,
  getMessages,
  removeMetadata,
  saveToolResponse,
} from './memory'
import { runTool } from './toolRunner'
import { showLoader, logMessage } from './ui'
import type { Tool } from 'ollama'

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: Tool[]
}) => {
  const loader = await showLoader('Loading...')
  let newUserMessage = {
    role: 'user',
    content: userMessage,
  }

  await addMessages([newUserMessage])

  while (true) {
    const history = await getMessages()

    const response = await runLLM({
      messages: history,
      tools,
    })

    let newAssistantMessage = {
      role: 'assistant',
      content: response.message.content,
    }

    await addMessages([newAssistantMessage])

    logMessage(addMetadata(newAssistantMessage))

    if (
      typeof response.message.content === 'string' &&
      response.message.content.length > 0
    ) {
      loader.stop()
      return getMessages()
    }

    if (
      Array.isArray(response.message.tool_calls) &&
      response.message.tool_calls.length > 0
    ) {
      // Tool calls are the calls that you'll have
      const toolCall = response.message.tool_calls[0]

      loader.update(`Running tool: ${toolCall.function.name}`)

      const toolResponse = await runTool(userMessage, toolCall)

      await saveToolResponse(toolCall.function.name, toolResponse)

      loader.update(`Tool ran: ${toolCall.function.name}`)
    }
  }
}
