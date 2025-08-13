import dynamic from 'next.js/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function NewArticle(){
    const r = useRouter()
    const { id } = r.query
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('')
    const [category,setCategory] = useState('')
    const [excerpt,setExcerpt] = useState('')

    // 配置 Quill 编辑器的工具栏和模块
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' },
                { 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            // 添加表格功能
            ['table'],
            ['clean']
        ],
        // 启用表格模块
        table: true,
    }), [])

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video',
        'table' // 添加表格格式支持
    ]

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
        try {
            if(id) await axios.put(`/api/articles/${id}`, payload)
            else await axios.post('/api/articles', payload)
            r.push('/admin/dashboard')
        } catch (error) {
            console.error('保存文章失败:', error)
            alert('保存失败，请重试')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input
                    value={title}
                    onChange={e=>setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="标题"
                    required
                />
                <input
                    value={excerpt}
                    onChange={e=>setExcerpt(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="摘要（可选）"
                />
                <input
                    value={category}
                    onChange={e=>setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="分类（可选）"
                />
                <div className="border border-gray-300 rounded-md">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        style={{ minHeight: '300px' }}
                        placeholder="开始编写你的文章内容..."
                    />
                </div>
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                        {id ? '更新文章' : '发布文章'}
                    </button>
                    <button
                        type="button"
                        onClick={() => r.push('/admin/dashboard')}
                        className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                        取消
                    </button>
                </div>
            </form>

            {/* 表格使用提示 */}
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800">
                <h4 className="font-semibold mb-2">表格功能使用提示：</h4>
                <ul className="space-y-1">
                    <li>• 点击工具栏中的表格图标插入表格</li>
                    <li>• 右键点击表格可以添加/删除行列</li>
                    <li>• 可以调整表格的对齐方式和样式</li>
                </ul>
            </div>
        </div>
    )
}