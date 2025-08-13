import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

export default function NewArticle(){
    const r = useRouter()
    const { id } = r.query
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('')
    const [category,setCategory] = useState('')
    const [excerpt,setExcerpt] = useState('')

    useEffect(()=>{
        if(id){
            axios.get(`/api/articles/${id}`).then(res=>{
                const a = res.data
                setTitle(a.title); setContent(a.content); setCategory(a.category || ''); setExcerpt(a.excerpt || '')
            })
        }
    },[id])

    async function submit(e){
        e.preventDefault()
        const payload = { title, content, category, excerpt }
        if(id) await axios.put(`/api/articles/${id}`, payload)
        else await axios.post('/api/articles', payload)
        r.push('/admin/dashboard')
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border" placeholder="标题" />
                <input value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full p-2 border" placeholder="摘要（可选）" />
                <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border" placeholder="分类（可选）" />
                <ReactQuill value={content} onChange={setContent} />
                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
