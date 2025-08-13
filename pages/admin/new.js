import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// 动态导入 ReactQuill 和相关模块
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill')

        // 动态导入 Quill 和表格模块
        const { default: Quill } = await import('quill')

        // 注册表格模块 - 使用 Quill 内置的表格功能
        const Table = Quill.import('formats/table')
        const TableCell = Quill.import('formats/table-cell-line')
        const TableRow = Quill.import('formats/table-row')
        const TableBody = Quill.import('formats/table-body')
        const TableCol = Quill.import('formats/table-col')
        const TableColGroup = Quill.import('formats/table-col-group')
        const TableContainer = Quill.import('formats/table-container')

        return RQ
    },
    {
        ssr: false,
        loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
    }
)

// 动态导入样式
import('react-quill/dist/quill.snow.css')

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
            ['clean']
        ]
    }), [])

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video'
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

    // 插入表格的函数
    const insertTable = () => {
        const tableHTML = `
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 1</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 2</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 3</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 4</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 5</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 6</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 7</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 8</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">单元格 9</td>
                    </tr>
                </tbody>
            </table>
        `
        setContent(prev => prev + tableHTML)
    }

    const insertSimpleTable = () => {
        const simpleTable = `
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin: 10px 0;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd;">标题1</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">标题2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">内容1</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">内容2</td>
                    </tr>
                </tbody>
            </table>
        `
        setContent(prev => prev + simpleTable)
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

                {/* 手动添加表格按钮 */}
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        onClick={insertTable}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                        插入表格 (3x3)
                    </button>
                    <button
                        type="button"
                        onClick={insertSimpleTable}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
                    >
                        插入简单表格
                    </button>
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
                    <li>• 点击上方的"插入表格"按钮来添加表格</li>
                    <li>• 表格插入后可以直接在编辑器中编辑内容</li>
                    <li>• 支持复制粘贴表格内容</li>
                    <li>• 可以手动调整表格的HTML代码来自定义样式</li>
                </ul>
            </div>
        </div>
    )
}