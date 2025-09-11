import { getTokenFromCookie, verifyToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 从Cookie获取Token
        const token = getTokenFromCookie(req);
        if (!token) {
            return res.status(401).json({ error: '未登录' });
        }

        // 验证Token
        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: '登录状态无效' });
        }

        // 查询用户信息
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, username: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('验证登录状态错误:', error);
        return res.status(401).json({ error: '登录状态无效', details: error.toString() });
    }
}
