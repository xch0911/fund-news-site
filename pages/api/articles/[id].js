import prisma from '../../../lib/prisma'

export default async function handler(req,res){
  const { id } = req.query
  const iid = parseInt(id)
  if(req.method === 'GET'){
    const a = await prisma.article.findUnique({ where: { id: iid } })
    if(!a) return res.status(404).end()
    await prisma.article.update({ where: { id: iid }, data: { views: a.views + 1 } })
    res.json(a)
  }else if(req.method === 'PUT'){
    const { title, content, excerpt, category, coverUrl, tags } = req.body
    const a = await prisma.article.update({ where: { id: iid }, data: { title, content, excerpt, category, coverUrl, tags } })
    res.json(a)
  }else if(req.method === 'DELETE'){
    await prisma.article.delete({ where: { id: iid } })
    res.json({ ok: true })
  }else{
    res.status(405).end()
  }
}
