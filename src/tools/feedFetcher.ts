import * as cheerio from 'cheerio'
import type { WebSearchPageResult, WebSearchResult } from './types/WebScrapper'
import axios from 'axios'
import xml2js from 'xml2js'
import { NodeHtmlMarkdown } from 'node-html-markdown'

import type { Tool } from 'ollama'
import { runLLM } from '../llm'

export class FeedFetcherTool {
  static FEED_RSS_URL = [
    'https://cprss.s3.amazonaws.com/javascriptweekly.com.xml',
  ]
  static MAX_LENGTH = 200
  static NUMBER_OF_RESULTS = 4
  static headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  }
  static tool: Tool = {
    type: 'function',
    function: {
      name: 'get_feed_articles',
      description: `Use this tool to get the latest articles from different RSS sources, scrap the articles and return a mardown summary`,
      parameters: {
        type: 'object',

        properties: {},
        required: [],
      },
    },
  } as const

  constructor() {}

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
    doc(
      'script, style, noscript, iframe, svg, nav, footer, header, aside, form, button'
    ).remove()

    let htmlText = doc('body').html() || ''

    return this.removeEmojis(htmlText)
  }

  static removeEmojis(text: string) {
    // NFD normalization means that characters are decomposed by their combination of simpler characters (e.g., accents are separated from the letter they modify).
    return text.normalize('NFD').replace(/[\u0300-\uFFFF]/g, '')
  }

  static async scrapWebPage(
    result: Partial<WebSearchResult>
  ): Promise<WebSearchPageResult> {
    // Integration point for all functions to work together

    try {
      let response = await fetch(result.url || '')

      let htmlContent = await response.text()

      let htmlText = await this.formatText(htmlContent)

      return {
        content: htmlText,
        url: result.url || '',
        title: result.title || '',
        snippet: this.generateExcerpt(htmlText, this.MAX_LENGTH),
      }
    } catch (error) {
      console.error(error)
      return {
        content: '',
        url: '',
        title: '',
        snippet: '',
      }
    }
  }

  static async fetchFeedLink(rssFeedUrl: string): Promise<string> {
    try {
      const { data } = await axios.get(rssFeedUrl)

      // Parse XML
      const parser = new xml2js.Parser()
      const result = await parser.parseStringPromise(data)

      // Extract article links
      const firstItem = result.rss.channel[0].item[0]

      return firstItem?.link || ''
    } catch (error: any) {
      console.error('❌ Error fetching RSS feed:', error.message)
      return ''
    }
  }

  static getLinksFromHtml(
    htmlContent: string
  ): { url: string; title: string }[] {
    const $ = cheerio.load(htmlContent)
    const links = $('a[target=_blank]')
      .map((_, element) => ({
        url: $(element).attr('href'),
        title: $(element).text().trim(),
      }))
      .get()

    return links
  }

  static async getFeedArticles(pageUrl: string) {
    try {
      let response = await fetch(pageUrl || '')

      let htmlContent = await response.text()

      let links = this.getLinksFromHtml(htmlContent)

      let articles = []

      for await (const linkEl of [links[6]]) {
        let article = await this.scrapWebPage(linkEl)

        console.log('article.url', article.url)

        let htmlToMarkdown = NodeHtmlMarkdown.translate(article.content, {
          keepDataImages: true,
        })

        console.log('htmlToMarkdown', htmlToMarkdown)

        let ollamaSummary = await runLLM({
          model: 'llama3.3:latest',
          messages: [
            {
              role: 'user',
              content: `
              Summarize the following article in a markdown format where you include:
              - A table with relevant points and information
              - A detailed summary of the article content
              - Usecases that I can apply on my day to day
              - A list of real time examples
              - Important key points,
              - why it's important for the JavaScript ecosystem and how can I use it in my day to day
              - 

              This is the information of the page: 
              - title: ${article.title}
              - About: ${article.snippet}
              - Markdown text ${htmlToMarkdown}
              `,
            },
          ],
          tools: [],
        })

        let ollamaStringSummary = ollamaSummary.message.content

        articles.push(ollamaStringSummary)
      }

      return articles
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static async getFeeds({}: any) {
    let rrssArticlesPromises = await Promise.all(
      this.FEED_RSS_URL.map((rrssUrl) => this.fetchFeedLink(rrssUrl))
    )

    let searchPromises = await Promise.all(
      rrssArticlesPromises.map((result) => this.getFeedArticles(result))
    )

    return JSON.stringify(
      searchPromises.map((result) => JSON.stringify(result))
    )
  }
}
