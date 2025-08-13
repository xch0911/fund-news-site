import Link from 'next/link'
import prisma from '../lib/prisma'
import Head from 'next/head'

export default function Home({ articles }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Head>
        <title>基金资讯 - 首页</title>
        <meta name="description" content="基金市场新闻、政策解读与产品分析" />
      </Head>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">基金资讯</h1>
        {/*<Link href="/admin"><a className="px-3 py-1 border rounded">管理后台</a></Link>*/}
      </header>

      <main className="space-y-4">
        {articles.map(a => (
          <article key={a.id} className="p-4 bg-white rounded shadow">
            <Link href={`/articles/${a.id}`}>
              <a>
                <h2 className="text-xl font-semibold">{a.title}</h2>
                <p className="text-sm text-gray-600">{a.excerpt || (a.content.slice(0, 120) + '...')}</p>
              </a>
            </Link>
            <div className="text-xs text-gray-500 mt-2">{new Date(a.createdAt).toLocaleString()}</div>
          </article>
        ))}
      </main>
    </div>
  )
}

export async function getServerSideProps(){
  const list = await prisma.article.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  return { props: { articles: JSON.parse(JSON.stringify(list)) } }
}
