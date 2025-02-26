import 'dotenv/config'

import { runAgent } from './src/agent'
import { WebScrapperTool } from './src/tools/webscrapper'
import { FeedFetcherTool } from './src/tools/feedFetcher'
const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

const response = await runAgent({
  userMessage,
  tools: [WebScrapperTool.tool, FeedFetcherTool.tool],
})

console.log(response)
process.exit(0)
