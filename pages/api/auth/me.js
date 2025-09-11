import { getTokenFromCookie, verifyToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        // 从 Cookie 中获取 token 并验证
        const token = getTokenFromCookie(req);
        if (!token) return res.status(401).json({ error: '未登录' });

        const payload = verifyToken(token); // 验证 token 有效性
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, username: true, role: true }, // 只返回需要的字段
        });

        if (!user) return res.status(401).json({ error: '用户不存在' });
        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: '登录状态无效' });
    }
}
