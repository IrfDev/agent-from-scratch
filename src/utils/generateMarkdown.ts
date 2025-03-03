import { DirectFileManipulator } from '../lib/crouch-db/livesync-commonlib/src'
type ExportableArticles = {
  title: string
  content: string
  url: string
}

function getMarkdownBlob(articleContent: string) {
  const articleBlob = new Blob([articleContent], { type: 'text/markdown' })

  return articleBlob
}

export async function saveMarkdown(articles: ExportableArticles[]) {
  let cDb = new DirectFileManipulator({
    database: 'obsidian-music',
    password: 'Toby2025!',
    url: 'https://obsidian-sync.irf.rocks',
    username: 'obsidian_user',
    obfuscatePassphrase: undefined,
    passphrase: undefined,
  }) // File manipulator to couch db database where we store
  // md files

  const timestampDate = new Date()
  // .toISOString().split('T')[0] // YYYY-MM-DD format

  let articlesBlob = articles.map((article) => {
    return {
      ...article,
      blob: getMarkdownBlob(article.content),
    }
  })

  let stringTimestamp = timestampDate.toISOString().split('T')[0]

  try {
    let saveArticlePromises = articlesBlob.map((articleWithBlob) =>
      cDb.put(
        `${stringTimestamp}/${articleWithBlob.title}.md`,
        articleWithBlob.blob,
        {
          ctime: timestampDate.getTime(),
          mtime: timestampDate.getTime(),
          size: articleWithBlob.blob.size,
        },
      ),
    )

    let results = await Promise.all(saveArticlePromises)

    console.log(results)
  } catch (error) {
    console.error(error)
  }
}
