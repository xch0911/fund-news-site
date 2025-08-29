import prisma from '../../lib/prisma'
import Head from 'next/head'

export default function Article({ article }) {
  if (!article) return <div className="p-6">未找到文章</div>
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head>
        <title>{article.title} - 亚洲基金网</title>
        <meta name="description" content={article.excerpt || article.title} />
      </Head>
      {article.coverUrl && <img src={article.coverUrl} alt="cover" className="mb-4 w-full rounded" />}
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose" />
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { id } = ctx.params
  const a = await prisma.article.findUnique({ where: { id: parseInt(id) } })
  if(!a) return { props: { article: null } }
  await prisma.article.update({ where: { id: a.id }, data: { views: a.views + 1 } })
  return { props: { article: JSON.parse(JSON.stringify(a)) } }
}
