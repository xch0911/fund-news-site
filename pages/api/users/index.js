import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../../../lib/middleware'

async function handler(req,res){
  if(req.method === 'GET'){
    const users = await prisma.user.findMany({ select: { id:true, username:true, role:true, createdAt:true } })
    res.json(users)
  }else if(req.method === 'POST'){
    const { username, password, role } = req.body
    if(!username || !password) return res.status(400).json({ error: '参数不完整' })
    const hash = await bcrypt.hash(password, 10)
    const u = await prisma.user.create({ data: { username, passwordHash: hash, role: role || 'editor' } })
    res.json({ id: u.id, username: u.username, role: u.role })
  }else{
    res.status(405).end()
  }
}

export default requireAuth(handler, ['admin'])
