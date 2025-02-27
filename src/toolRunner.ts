import type { ToolCall } from 'ollama'
import { FeedFetcherTool } from './tools/feedFetcher'

export const runTool = async (userMessage: string, toolCall: ToolCall) => {
  const input = {
    userMessage,
    toolArgs: toolCall.function.arguments,
  }

  switch (toolCall.function.name) {
    case 'get_feed_articles':
      return FeedFetcherTool.getFeeds(input)

    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}
