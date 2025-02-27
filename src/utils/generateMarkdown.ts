const fs = require('fs')
const path = require('path')

type ExportableArticles = {
  title: string
  content: string
  url: string
}

function saveMarkdown(articles: ExportableArticles[]) {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const filePath = path.join(__dirname, `weekly-summary-${timestamp}.md`)

  articles.forEach((article) => {
    fs.writeFileSync(article.title + '.md', article.content, 'utf8')
  })

  console.log(`✅ Markdown report saved: ${filePath}`)
}

module.exports = { saveMarkdown }
