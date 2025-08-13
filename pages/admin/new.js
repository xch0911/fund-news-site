import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// 动态导入ReactQuill并注册表格模块
const ReactQuill = dynamic(
    async () => {
        const ReactQuill = await import('react-quill');
        const { Quill } = ReactQuill;

        // 动态导入表格插件
        const QuillBetterTable = await import('quill-better-table');

        // 注册表格模块
        Quill.register('modules/table', QuillBetterTable.TableModule);

        return ReactQuill;
    },
    {
        ssr: false,
        loading: () => <p>加载编辑器...</p>
    }
);

// 导入编辑器样式
import 'react-quill/dist/quill.snow.css';
// 导入表格插件样式
import 'quill-better-table/dist/quill-better-table.css';

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

    // 配置编辑器模块（包含表格支持）
    const modules = {
        table: true, // 启用表格模块
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            ['insertTable'] // 添加表格插入按钮
        ]
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border" placeholder="标题" />
                <input value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full p-2 border" placeholder="摘要（可选）" />
                <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border" placeholder="分类（可选）" />

                {/* 启用表格模块的编辑器 */}
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="在此处粘贴表格..."
                />

                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}