import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// 简单的动态导入，不涉及任何表格模块
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
        <span className="text-gray-500">加载编辑器中...</span>
    </div>
})

// 动态导入样式
if (typeof window !== 'undefined') {
    import('react-quill/dist/quill.snow.css')
}

export default function NewArticle(){
    const r = useRouter()
    const { id } = r.query
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('')
    const [category,setCategory] = useState('')
    const [excerpt,setExcerpt] = useState('')

    // 使用 useRef 获取 ReactQuill 实例
    const quillRef = useRef(null)

    // 完全不涉及表格的 Quill 配置
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

    // 获取 Quill 编辑器实例
    const getQuillInstance = () => {
        return quillRef.current?.getEditor?.()
    }

    // 表格插入函数 - 使用 Quill API
    const insertTable = (rows = 3, cols = 3) => {
        const quill = getQuillInstance()
        if (!quill) {
            console.warn('Quill 编辑器未就绪')
            return
        }

        const range = quill.getSelection()
        const position = range ? range.index : quill.getLength()

        // 构建表格 HTML
        let tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>`

        for(let i = 0; i < rows; i++) {
            tableHTML += '<tr>'
            for(let j = 0; j < cols; j++) {
                tableHTML += `<td style="padding: 8px; border: 1px solid #ddd; min-width: 100px;">单元格 ${i * cols + j + 1}</td>`
            }
            tableHTML += '</tr>'
        }
        tableHTML += '</tbody></table><p><br></p>'

        // 使用 clipboard.dangerouslyPasteHTML 插入 HTML
        try {
            quill.clipboard.dangerouslyPasteHTML(position, tableHTML)
            quill.setSelection(position + 1)
        } catch (error) {
            console.error('插入表格失败:', error)
            // 回退方案：直接修改内容
            setContent(prev => prev + '\n' + tableHTML)
        }
    }

    const insertHeaderTable = () => {
        const quill = getQuillInstance()
        if (!quill) {
            console.warn('Quill 编辑器未就绪')
            return
        }

        const range = quill.getSelection()
        const position = range ? range.index : quill.getLength()

        const tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: center;">列标题1</th>
                        <th style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: center;">列标题2</th>
                        <th style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: center;">列标题3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据1</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据2</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据3</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据4</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据5</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">数据6</td>
                    </tr>
                </tbody>
            </table><p><br></p>`

        try {
            quill.clipboard.dangerouslyPasteHTML(position, tableHTML)
            quill.setSelection(position + 1)
        } catch (error) {
            console.error('插入表格失败:', error)
            // 回退方案：直接修改内容
            setContent(prev => prev + '\n' + tableHTML)
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
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        style={{ minHeight: '300px' }}
                        placeholder="开始编写你的文章内容..."
                    />
                </div>

                {/* 表格插入工具栏 */}
                <div className="bg-gray-50 p-4 rounded-md border">
                    <h4 className="font-medium text-gray-700 mb-3">表格工具</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => insertTable(2, 2)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                            2×2 表格
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTable(3, 3)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                            3×3 表格
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTable(4, 4)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                            4×4 表格
                        </button>
                        <button
                            type="button"
                            onClick={insertHeaderTable}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                            带标题表格
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTable(5, 2)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                            列表表格 (5×2)
                        </button>
                    </div>
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

            {/* 使用提示 */}
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800">
                <h4 className="font-semibold mb-2">表格功能说明：</h4>
                <ul className="space-y-1">
                    <li>• 使用上方的表格工具按钮插入不同尺寸的表格</li>
                    <li>• 表格插入后可以直接在编辑器中编辑内容</li>
                    <li>• 支持在表格单元格中使用富文本格式（加粗、颜色等）</li>
                    <li>• 可以复制粘贴Excel或其他表格内容</li>
                    <li>• 表格样式已经预设，确保在前端显示美观</li>
                </ul>
            </div>
        </div>
    )
}