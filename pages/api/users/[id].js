import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../../../lib/middleware'

async function handler(req,res){
  const id = parseInt(req.query.id)
  if(req.method === 'GET'){
    const u = await prisma.user.findUnique({ where: { id }, select: { id:true, username:true, role:true, createdAt:true } })
    return res.json(u)
  }else if(req.method === 'PUT'){
    const { password, role } = req.body
    const data = {}
    if(password) data.passwordHash = await bcrypt.hash(password,10)
    if(role) data.role = role
    const u = await prisma.user.update({ where: { id }, data })
    return res.json({ id: u.id, username: u.username, role: u.role })
  }else if(req.method === 'DELETE'){
    await prisma.user.delete({ where: { id } })
    return res.json({ ok: true })
  }else{
    res.status(405).end()
  }
}

export default requireAuth(handler, ['admin'])
