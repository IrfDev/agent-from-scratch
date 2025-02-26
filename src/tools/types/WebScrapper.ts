export type WebSearchResult = {
  url: string
  title: string
  content: string
  thumbnail?: string
  engine: string
  template: string
  parsed_url: string[]
  engines: string[]
  positions: number[]
  publishedDate?: string
  score: number
  category: string
}

export type WebSearchPageResult = {
  title: string
  url: string
  content: string
  snippet: string
}
