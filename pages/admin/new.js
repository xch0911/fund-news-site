import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'


// const ReactQuill = dynamic(
//     async () => {
//         // 1. 加载 Quill 核心
//         const Quill = (await import('quill')).default;
//
//         // 2. 修复键盘绑定
//         if (!Quill.import('modules/keyboard').default.keyboard.bindings.Backspace) {
//             Quill.import('modules/keyboard').default.keyboard.bindings.Backspace = [];
//         }
//
//         // 3. 注册表格模块
//         const { default: QuillBetterTable } = await import('quill-better-table');
//         Quill.register('modules/betterTable', QuillBetterTable);
//
//         // 4. 加载 ReactQuill
//         const { default: RQ } = await import('react-quill');
//         return RQ;
//     },
//     {
//         ssr: false,
//         loading: () => <p>加载编辑器中...</p> // 加载状态提示
//     }
// );


const ReactQuill = dynamic(
    async () => {
        // 分步加载依赖
        try {
            const Quill = await import('quill');
            if (!Quill.import('modules/keyboard').default.keyboard.bindings.Backspace) {
                Quill.import('modules/keyboard').default.keyboard.bindings.Backspace = [];
            }
            console.log(Quill)
            const {default: QuillBetterTable} = await import('quill-better-table');
            console.log(QuillBetterTable)
            // 注册模块
            Quill.default.register('modules/betterTable', QuillBetterTable);

            const {default: ReactQuillLib} = await import('react-quill');
            console.log(ReactQuillLib)
        } catch (e) {
            console.error('加载失败', e);
            return () => <div>编辑器加载失败</div>;
        }

        // 返回ReactQuill组件
        return ReactQuillLib
    },
    {
        ssr: false,
        loading: () => (
            <div className="p-4 text-center text-gray-500">
                编辑器加载中，请稍候...
            </div>
        )
    }
);

import 'react-quill/dist/quill.snow.css'

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
        betterTable: true, // 启用表格模块
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            ['insertTable']// 添加表格插入按钮
        ],
        keyboard: {
            bindings: {
                Backspace: {
                    key: 'Backspace',
                    handler: () => { /* 自定义处理逻辑 */ }
                }
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border" placeholder="标题" />
                <input value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full p-2 border" placeholder="摘要（可选）" />
                <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border" placeholder="分类（可选）" />
                <ReactQuill value={content} onChange={setContent}  modules={modules}  />
                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
