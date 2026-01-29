import Link from 'next/link'
import Head from 'next/head'
import prisma from '../../lib/prisma'

export default function Article({ article, latestArticles }) {
  if (!article) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
          <div>
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <Link href="/"><a className="text-blue-500 hover:underline">Return to Home</a></Link>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      <Head>
        <title>{article.title} - 亚洲基金研究</title>
        <meta name="description" content={article.excerpt || article.title} />
      </Head>

      {/* Header (Duplicated from Index for consistency) */}
      <header className="bg-slate-900 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/">
                            <a className="text-2xl font-bold tracking-tight text-blue-400 hover:text-blue-300 transition-colors">
                                AFR <span className="text-white text-lg font-normal ml-2">亚洲基金研究</span>
                            </a>
                        </Link>
                        <nav className="hidden md:flex space-x-6 text-sm font-medium">
                            <Link href="/"><a className="hover:text-blue-300">首页</a></Link>
                            <a href="#" className="hover:text-blue-300">市场动态</a>
                            <a href="#" className="hover:text-blue-300">基金数据</a>
                            <a href="#" className="hover:text-blue-300">深度视点</a>
                        </nav>
                    </div>
                </div>
            </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 text-xs text-gray-500">
              <Link href="/"><a className="hover:text-blue-600">首页</a></Link>
              <span className="mx-2">/</span>
              <span>研究报告</span>
              <span className="mx-2">/</span>
              <span className="text-gray-400 truncate max-w-xs">{article.title}</span>
          </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                {/* Article Header */}
                <header className="mb-8 border-b border-gray-100 pb-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">深度分析</span>
                        <span className="text-gray-400 text-xs">{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        {article.title}
                    </h1>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                                AFR
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">亚洲基金研究员</div>
                                <div className="text-xs text-gray-500">资深市场分析师</div>
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 space-x-4">
                             <span>阅读 {article.views}</span>
                             {/* Share buttons mock */}
                             <div className="flex space-x-2">
                                 <span className="cursor-pointer hover:text-blue-600">Share</span>
                             </div>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {article.coverUrl && (
                    <div className="mb-8 rounded-lg overflow-hidden border border-gray-100">
                        <img src={article.coverUrl} alt={article.title} className="w-full h-auto" />
                        <p className="text-center text-xs text-gray-400 mt-2 italic">图源：Asian Fund Research Database</p>
                    </div>
                )}

                {/* Article Body */}
                <div 
                    className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-7 prose-a:text-blue-600 prose-img:rounded-lg prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: article.content }} 
                />

                {/* Disclaimer */}
                <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <strong>免责声明：</strong> 本文仅代表作者个人观点，不代表亚洲基金研究平台立场。文中内容不构成任何投资建议、邀约或推荐。市场有风险，投资需谨慎。
                </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
                {/* Related / Latest */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-base text-slate-800 mb-4 pb-2 border-b border-gray-100">最新发布</h3>
                    <ul className="space-y-4">
                        {latestArticles && latestArticles.length > 0 ? (
                            latestArticles.map((a) => (
                                <li key={a.id} className="group">
                                    <Link href={`/articles/${a.id}`}>
                                        <a className="block">
                                            <span className="text-xs text-blue-500 block mb-1">{new Date(a.createdAt).toLocaleDateString()}</span>
                                            <h4 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 line-clamp-2 leading-snug">
                                                {a.title}
                                            </h4>
                                        </a>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="text-sm text-gray-400">暂无相关推荐</li>
                        )}
                    </ul>
                </div>

                {/* Tags Cloud Mock */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-base text-slate-800 mb-4 pb-2 border-b border-gray-100">热门标签</h3>
                    <div className="flex flex-wrap gap-2">
                         {['宏观经济', 'A股', '债券', 'ETF', '私募', '量化投资', 'ESG'].map(tag => (
                             <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">
                                 {tag}
                             </span>
                         ))}
                    </div>
                </div>
            </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p className="text-[10px] text-slate-600">&copy; 2026 Asia Fund Research. All Rights Reserved.</p>
            </div>
      </footer>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { id } = ctx.params
  
  try {
      const [article, latestArticles] = await Promise.all([
          prisma.article.findUnique({ where: { id: parseInt(id) } }),
          prisma.article.findMany({ 
              take: 5, 
              orderBy: { createdAt: 'desc' },
              where: { NOT: { id: parseInt(id) } },
              select: { id: true, title: true, createdAt: true }
          })
      ])
      
      if(!article) return { props: { article: null, latestArticles: [] } }
      
      // Update views without blocking? Better to await to ensure consistancy in this simple app context
      await prisma.article.update({ where: { id: article.id }, data: { views: article.views + 1 } })
      
      return { 
          props: { 
              article: JSON.parse(JSON.stringify(article)),
              latestArticles: JSON.parse(JSON.stringify(latestArticles))
          } 
      }
  } catch (error) {
      console.error(error);
      return { props: { article: null, latestArticles: [] } }
  }
}
