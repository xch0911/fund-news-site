import Link from 'next/link'
import Head from 'next/head'
import prisma from '../lib/prisma'

// Utility to clean HTML content for excerpts
const stripHtmlTags = (html) => {
    if (!html) return '';
    const plainText = html.replace(/<[^>]*>/g, '');
    return plainText.replace(/\s+/g, ' ').trim();
};

// Mock Data for financial look
const marketIndices = [
    { name: '上证指数', value: '3,050.45', change: '+0.45%', up: true },
    { name: '深证成指', value: '10,150.32', change: '-0.21%', up: false },
    { name: '恒生指数', value: '18,456.90', change: '+1.12%', up: true },
    { name: '标普500', value: '4,450.50', change: '+0.05%', up: true },
];

export default function Home({ articles, currentPage, totalPages }) {
    
    const renderPagination = () => {
        const pages = [];
        // First
        pages.push(
            <Link key="first" href={`/?page=1`}>
                <a className={`px-2 py-1 mx-1 text-sm border rounded ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                    &laquo; 首页
                </a>
            </Link>
        );

        // Prev
        if (currentPage > 1) {
             pages.push(
                <Link key="prev" href={`/?page=${currentPage - 1}`}>
                    <a className="px-2 py-1 mx-1 text-sm border rounded text-blue-600 border-blue-200 hover:bg-blue-50">
                        上一页
                    </a>
                </Link>
            );
        }

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Link key={i} href={`/?page=${i}`}>
                    <a className={`px-3 py-1 mx-1 text-sm rounded border ${currentPage === i ? 'bg-blue-900 text-white border-blue-900' : 'text-blue-900 border-gray-200 hover:bg-gray-50'}`}>
                        {i}
                    </a>
                </Link>
            );
        }

        // Next
        if (currentPage < totalPages) {
             pages.push(
                <Link key="next" href={`/?page=${currentPage + 1}`}>
                    <a className="px-2 py-1 mx-1 text-sm border rounded text-blue-600 border-blue-200 hover:bg-blue-50">
                        下一页
                    </a>
                </Link>
            );
        }

         // Last
         pages.push(
            <Link key="last" href={`/?page=${totalPages}`}>
                <a className={`px-2 py-1 mx-1 text-sm border rounded ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                    末页 &raquo;
                </a>
            </Link>
        );

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <Head>
                <title>亚洲基金研究 (Asia Fund Research) - 首页</title>
                <meta name="description" content="专业基金市场分析与深度研究" />
            </Head>

            {/* Header */}
            <header className="bg-slate-900 text-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold tracking-tight text-blue-400">
                                AFR <span className="text-white text-lg font-normal ml-2">亚洲基金研究</span>
                            </h1>
                            <nav className="hidden md:flex space-x-6 text-sm font-medium">
                                <Link href="/"><a className="text-white border-b-2 border-blue-400 pb-5 pt-5">首页</a></Link>
                                <a href="#" className="hover:text-blue-300">市场动态</a>
                                <a href="#" className="hover:text-blue-300">基金数据</a>
                                <a href="#" className="hover:text-blue-300">深度视点</a>
                                <Link href="/admin"><a className="hover:text-blue-300 opacity-60">管理后台</a></Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* Indices Ticker */}
            <div className="bg-white border-b border-gray-200 py-3 overflow-x-auto shadow-sm">
                <div className="container mx-auto px-4 flex items-center space-x-6 text-sm whitespace-nowrap">
                    <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Market Indices:</span>
                    {marketIndices.map((idx, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">{idx.name}</span>
                            <span className={idx.up ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{idx.value}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${idx.up ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{idx.change}</span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* LEFT COLUMN: Main Articles */}
                    <div className="lg:col-span-3">
                        <div className="flex items-baseline justify-between mb-6 border-b border-gray-200 pb-2">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">最新研究 Briefing</h2>
                            <span className="text-xs text-gray-400 hidden sm:inline">深度透视 • 价值发现</span>
                        </div>

                        <div className="space-y-6">
                            {articles && articles.length > 0 ? (
                                articles.map(a => (
                                    <article key={a.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Dummy Image Placeholder if no coverUrl */}
                                            <div className="hidden md:flex w-48 h-32 bg-slate-100 rounded items-center justify-center text-slate-300 shrink-0 overflow-hidden">
                                                {a.coverUrl ? (
                                                    <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl font-light text-slate-200">AFR</span>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-widest">Research</span>
                                                        <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <Link href={`/articles/${a.id}`}>
                                                        <a>
                                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 leading-tight mb-3">
                                                                {a.title}
                                                            </h3>
                                                        </a>
                                                    </Link>
                                                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                        {a.excerpt || stripHtmlTags(a.content).substring(0, 160) + '...'}
                                                    </p>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>亚洲基金研究员</span>
                                                        <span>{a.views || 0} 阅读</span>
                                                    </div>
                                                    <Link href={`/articles/${a.id}`}>
                                                        <a className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline">Read Analysis &rarr;</a>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white rounded shadow-sm">
                                    <p className="text-gray-400 mb-2">暂无研究报告</p>
                                    <p className="text-xs text-gray-300">Please check back later</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12">
                                {renderPagination()}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Highlights */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-base text-slate-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                                <span>市场焦点</span>
                                <span className="text-xs text-blue-500 cursor-pointer">更多</span>
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    { title: "美联储加息周期下的亚洲债市展望", tag: "债券" },
                                    { title: "2026年新能源基金投资策略报告", tag: "行业" },
                                    { title: "量化指增产品超额收益分析", tag: "量化" }
                                ].map((item, i) => (
                                    <li key={i} className="group cursor-pointer">
                                        <div className="flex items-center mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                                            <span className="text-[10px] text-gray-400 uppercase">{item.tag}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 leading-snug">{item.title}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Top Read (Using current data slice as mock) */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-base text-slate-800 mb-4 pb-2 border-b border-gray-100">阅读排行</h3>
                            <ul className="space-y-4">
                                {articles && articles.slice(0, 5).map((a, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className={`text-xl font-bold italic leading-none ${i < 3 ? 'text-blue-600 opacity-80' : 'text-gray-200'}`}>{i + 1}</span>
                                        <Link href={`/articles/${a.id}`}>
                                            <a className="text-xs font-medium text-gray-600 hover:text-blue-600 line-clamp-2">
                                                {a.title}
                                            </a>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg p-6 shadow-lg">
                            <h3 className="font-bold text-lg mb-2">订阅 Morning Call</h3>
                            <p className="text-xs text-slate-300 mb-4 leading-relaxed">获取每日开盘前的关键市场情报与基金经理观点。</p>
                            <input type="email" placeholder="输入您的邮箱" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 mb-2 placeholder-slate-400" />
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors uppercase tracking-wider">
                                Subscribe Now
                            </button>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold text-lg mb-4">关于 亚洲基金研究</h4>
                        <p className="text-xs leading-relaxed max-w-md text-slate-500">
                            AFR 是领先的独立基金研究平台，致力于为机构投资者与高净值个人提供客观、深入的数据分析与市场洞察。我们要做的不仅是资讯的搬运工，更是价值的发现者。
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">快速链接</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#" className="hover:text-blue-300">关于我们</a></li>
                            <li><a href="#" className="hover:text-blue-300">加入我们</a></li>
                            <li><a href="#" className="hover:text-blue-300">研究方法论</a></li>
                            <li><a href="#" className="hover:text-blue-300">联系交流</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">免责声明</h4>
                        <p className="text-[10px] leading-relaxed text-slate-600">
                            本网站内容仅供参考，不构成投资建议。基金有风险，投资需谨慎。过往业绩不代表未来表现。
                        </p>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-600">&copy; 2026 Asia Fund Research. All Rights Reserved. 沪ICP备xxxxxx号</p>
                </div>
            </footer>
        </div>
    )
}

export async function getServerSideProps(context) {
    const PAGE_SIZE = 10;
    const page = parseInt(context.query.page) || 1;
    const skip = (page - 1) * PAGE_SIZE;

    const [articles, totalCount] = await Promise.all([
        prisma.article.findMany({
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE,
            skip: skip
        }),
        prisma.article.count()
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return {
        props: {
            articles: JSON.parse(JSON.stringify(articles)),
            currentPage: page,
            totalPages: totalPages
        }
    };
}
