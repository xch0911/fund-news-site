import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { generateToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    try {
        // 查找用户
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 生成Token
        const token = generateToken(user);

        // 设置Token到Cookie
        setTokenCookie(res, token);

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            message: '登录成功',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('登录错误:', error);
        return res.status(500).json({ error: '服务器错误' });
    }
}
