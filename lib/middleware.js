import { verifyToken } from './auth'

export function requireAuth(handler, roles = []){
  return async (req,res) => {
    const cookies = req.headers.cookie
    if(!cookies) return res.status(401).json({ error: '未登录' })
    const tokenCookie = cookies.split(';').map(c=>c.trim()).find(c=>c.startsWith('token='))
    if(!tokenCookie) return res.status(401).json({ error: '未登录' })
    const token = tokenCookie.split('=')[1]
    const payload = verifyToken(token)
    if(!payload) return res.status(401).json({ error: '无效的 token' })
    if(roles.length && !roles.includes(payload.role)) return res.status(403).json({ error: '无权限' })
    req.user = payload
    return handler(req,res)
  }
}
