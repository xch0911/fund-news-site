import Link from 'next/link'
import prisma from '../lib/prisma'
import Head from 'next/head'

// 新增：清理HTML标签的工具函数
const stripHtmlTags = (html) => {
    // 处理空值情况，避免报错
    if (!html) return '';
    // 正则表达式匹配并移除所有HTML标签
    const plainText = html.replace(/<[^>]*>/g, '');
    // 移除多余的空格和换行符，让文本更整洁
    return plainText.replace(/\s+/g, ' ').trim();
};

export default function Home({ articles, currentPage, totalPages }) {
    // 生成页码导航
    const renderPagination = () => {
        const pages = [];
        // 添加首页按钮
        pages.push(
            <Link key="first" href={`/?page=1`}>
                <a className={`px-3 py-1 mx-1 rounded border ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                    首页
                </a>
            </Link>
        );

        // 添加上一页按钮
        pages.push(
            <Link key="prev" href={`/?page=${Math.max(1, currentPage - 1)}`}>
                <a className={`px-3 py-1 mx-1 rounded border ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                    上一页
                </a>
            </Link>
        );

        // 生成页码按钮（显示当前页前后2页）
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Link key={i} href={`/?page=${i}`}>
                    <a className={`px-3 py-1 mx-1 rounded border ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                        {i}
                    </a>
                </Link>
            );
        }

        // 添加下一页按钮
        pages.push(
            <Link key="next" href={`/?page=${Math.min(totalPages, currentPage + 1)}`}>
                <a className={`px-3 py-1 mx-1 rounded border ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                    下一页
                </a>
            </Link>
        );

        // 添加末页按钮
        pages.push(
            <Link key="last" href={`/?page=${totalPages}`}>
                <a className={`px-3 py-1 mx-1 rounded border ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                    末页
                </a>
            </Link>
        );

        return pages;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Head>
                <title>亚洲基金研究 - 首页</title>
                <meta name="description" content="基金市场新闻、政策解读与产品分析" />
            </Head>
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">亚洲基金研究</h1>
                {/*<Link href="/admin"><a className="px-3 py-1 border rounded">管理后台</a></Link>*/}
            </header>

            <main className="space-y-4">
                {articles.length > 0 ? (
                    articles.map(a => (
                        <article key={a.id} className="p-4 bg-white rounded shadow">
                            <Link href={`/articles/${a.id}`}>
                                <a>
                                    <h2 className="text-xl font-semibold">{a.title}</h2>
                                    {/* 关键修改：调用stripHtmlTags处理富文本 */}
                                    <p className="text-sm text-gray-600">
                                        {a.excerpt || (stripHtmlTags(a.content).slice(0, 120) + '...')}
                                    </p>
                                </a>
                            </Link>
                            <div className="text-xs text-gray-500 mt-2">{new Date(a.createdAt).toLocaleString()}</div>
                        </article>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">暂无文章数据</p>
                    </div>
                )}
            </main>

            {/* 分页导航 */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-4">
                    {renderPagination()}
                </div>
            )}
        </div>
    )
}

export async function getServerSideProps(context) {
    // 每页显示的文章数量
    const PAGE_SIZE = 10;

    // 从URL参数获取当前页码，默认为1
    const page = parseInt(context.query.page) || 1;

    // 计算跳过的文章数量（分页偏移量）
    const skip = (page - 1) * PAGE_SIZE;

    // 并行查询：获取当前页文章和总文章数
    const [articles, totalCount] = await Promise.all([
        prisma.article.findMany({
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE,
            skip: skip
        }),
        prisma.article.count()
    ]);

    // 计算总页数
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // 如果请求的页码超过总页数，重定向到最后一页
    if (page > totalPages && totalPages > 0) {
        return {
            redirect: {
                destination: `//?page=${totalPages}`,
                permanent: false
            }
        };
    }

    return {
        props: {
            articles: JSON.parse(JSON.stringify(articles)),
            currentPage: page,
            totalPages: totalPages
        }
    };
}
