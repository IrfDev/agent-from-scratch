import * as cheerio from 'cheerio'
import type { WebSearchPageResult, WebSearchResult } from './types/WebScrapper'
import axios from 'axios'
import { URL, URLSearchParams } from 'node:url'
import type { Tool } from 'ollama'

export class WebScrapperTool {
  static MAX_LENGTH = 200
  static NUMBER_OF_RESULTS = 4
  static headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  }
  static SEARXNG_URL = `http://192.168.1.83:30011/search`
  static tool: Tool = {
    type: 'function',
    function: {
      name: 'get_search_results',
      description: 'Get search results from the web',
      parameters: {
        type: 'object',

        properties: {
          query: { type: 'string', description: 'The search query to perform' },
        },
        required: ['query'],
      },
    },
  } as const

  constructor() {}

  static getBaseURL(url: string) {
    let parsedUrl = new URL(url)
    return parsedUrl.toString()
  }

  static generateExcerpt(content: any, maxLength = 200) {
    if (typeof content === 'string') {
      if (content.length > maxLength) {
        return content.substring(0, maxLength) + '...'
      } else {
        return content
      }
    } else {
      throw new Error(`Content is not a string`)
    }
  }

  static formatText(originalText: string) {
    let doc = cheerio.load(originalText)
    let htmlText = doc('body').text().trim()

    console.log('htmlText', htmlText)

    return this.removeEmojis(htmlText)
  }

  static removeEmojis(text: string) {
    // NFD normalization means that characters are decomposed by their combination of simpler characters (e.g., accents are separated from the letter they modify).
    return text.normalize('NFD').replace(/[\u0300-\uFFFF]/g, '')
  }

  static async scrapWebPage(
    result: WebSearchResult
  ): Promise<WebSearchPageResult> {
    // Integration point for all functions to work together

    try {
      let response = await fetch(result.url)

      let htmlContent = await response.text()

      let htmlText = await this.formatText(htmlContent)

      return {
        content: htmlText,
        url: result.url,
        title: result.title,
        snippet: this.generateExcerpt(result.content, this.MAX_LENGTH),
      }
    } catch (error) {
      return {
        content: '',
        url: '',
        title: '',
        snippet: '',
      }
    }
  }

  static async searchWeb({ toolArgs }: any) {
    let baseUrl = this.SEARXNG_URL

    console.log('toolArgs', toolArgs)
    let queryParams = {
      q: toolArgs.query,
      format: 'json',
      number_of_results: `${this.NUMBER_OF_RESULTS}`,
    }

    let searchUrl = new URL(baseUrl)
    searchUrl.search = new URLSearchParams(queryParams).toString()

    let searchUrlString = searchUrl.toString()

    let response = await axios.get(searchUrlString)

    let results = response.data.results as WebSearchResult[]

    let searchPromises = results.map((result: WebSearchResult) =>
      this.scrapWebPage(result)
    )

    let searchResults = await Promise.all(searchPromises)

    console.log('searchResults', searchResults)

    return JSON.stringify(searchResults.map((result) => JSON.stringify(result)))
  }
}
