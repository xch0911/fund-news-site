import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // 从查询参数获取页码和每页数量，设置默认值
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;

            // 计算跳过的记录数
            const skip = (page - 1) * pageSize;

            // 并行执行两个查询：获取当前页数据和总记录数
            const [articles, totalCount] = await Promise.all([
                prisma.article.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: pageSize,  // 每页显示的数量
                    skip: skip       // 跳过前面的记录
                }),
                prisma.article.count()  // 获取总记录数
            ]);

            // 返回分页数据，包括文章列表、总记录数和总页数
            res.json({
                articles,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            console.error('获取文章列表失败:', error);
            res.status(500).json({ message: '获取文章列表失败' });
        }
    } else if (req.method === 'POST') {
        try {
            const { title, content, excerpt, category, coverUrl, tags } = req.body;

            // 生成slug
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') + '-' + Date.now();

            const article = await prisma.article.create({
                data: { title, content, excerpt, category, coverUrl, tags, slug }
            });

            res.status(201).json(article);
        } catch (error) {
            console.error('创建文章失败:', error);
            res.status(500).json({ message: '创建文章失败' });
        }
    } else {
        // 不支持的HTTP方法
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`方法 ${req.method} 不被允许`);
    }
}
