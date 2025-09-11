import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const { username, password, role } = req.body
  if(!username || !password) return res.status(400).json({ error: '用户名和密码必填' })

  const existing = await prisma.user.findUnique({ where: { username } })
  if(existing) return res.status(409).json({ error: '用户名已存在' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { username, passwordHash: hash, role: role || 'editor' } })
  const token = generateToken({ id: user.id, username: user.username, role: user.role })
  setTokenCookie(res, token)
  res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } })
}
