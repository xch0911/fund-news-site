import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if(!user) return res.status(401).json({ error: '用户名或密码错误' })
  const ok = await bcrypt.compare(password, user.passwordHash);
  const hash = await bcrypt.hash(password, 10)
  console.log(hash);
  if(!ok) return res.status(401).json({ error: '用户名或密码错误' })
  const token = signToken({ id: user.id, username: user.username, role: user.role })
  setTokenCookie(res, token)
  res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } })
}
