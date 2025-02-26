import type { ToolCall } from 'ollama'
import { WebScrapperTool } from './tools/webscrapper'
import { FeedFetcherTool } from './tools/feedFetcher'

export const runTool = async (userMessage: string, toolCall: ToolCall) => {
  const input = {
    userMessage,
    toolArgs: toolCall.function.arguments,
  }

  switch (toolCall.function.name) {
    case 'get_search_results':
      return WebScrapperTool.searchWeb(input)

    case 'get_feed_articles':
      return FeedFetcherTool.getFeeds(input)

    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}
