import jwt from 'jsonwebtoken';

// 从环境变量获取密钥（确保在.env文件中配置）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token有效期7天

// 生成JWT Token
export function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// 验证JWT Token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // 验证失败返回null
    }
}

// 从Cookie中获取Token
export function getTokenFromCookie(req) {
    if (!req.headers.cookie) {
        return null;
    }

    const tokenCookie = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('token='));

    if (!tokenCookie) {
        return null;
    }

    return tokenCookie.split('=')[1];
}

// 设置Token到Cookie
export function setTokenCookie(res, token) {
    res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''}`
    ]);
}

// 清除Cookie中的Token
export function clearTokenCookie(res) {
    res.setHeader('Set-Cookie', [
        `token=; HttpOnly; Path=/; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''}`
    ]);
}
