import prisma from '../../../lib/prisma'

export default async function handler(req,res){
  if(req.method === 'GET'){
    const list = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(list)
  }else if(req.method === 'POST'){
    const { title, content, excerpt, category, coverUrl, tags } = req.body
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + Date.now()
    const a = await prisma.article.create({ data: { title, content, excerpt, category, coverUrl, tags, slug } })
    res.json(a)
  }else{
    res.status(405).end()
  }
}
