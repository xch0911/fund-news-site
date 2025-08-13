import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// 动态导入ReactQuill，禁用SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function NewArticle() {
    const r = useRouter()
    const { id } = r.query
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [modules, setModules] = useState(null)
    const [isLoadingEditor, setIsLoadingEditor] = useState(true)

    // 仅在客户端动态加载Quill和表格模块
    useEffect(() => {
        const loadQuillDependencies = async () => {
            try {
                // 首先加载Quill核心
                const quillModule = await import('quill')
                const Quill = quillModule.default

                // 然后加载表格插件
                const tableModule = await import('quill-better-table')

                // 从表格插件中获取所需模块（注意这里的导出结构可能因版本而异）
                const { default: TableModule, TableToolbar } = tableModule

                // 注册表格模块
                Quill.register({
                    'modules/table': TableModule,
                    'formats/table': TableModule.tableFormat,
                    'formats/cell': TableModule.cellFormat,
                    'formats/row': TableModule.rowFormat,
                    'modules/tableToolbar': TableToolbar
                }, true)

                // 配置工具栏
                setModules({
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'header': [1, 2, 3, false] }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['table']
                    ],
                    table: true,
                    tableToolbar: true,
                    history: {
                        userOnly: true
                    }
                })
            } catch (error) {
                console.error('加载富文本编辑器依赖失败:', error)
                alert('编辑器加载失败，请刷新页面重试')
            } finally {
                setIsLoadingEditor(false)
            }
        }

        loadQuillDependencies()
    }, [])

    // 加载文章数据
    useEffect(() => {
        if (id) {
            axios.get(`/api/articles/${id}`).then(res => {
                const a = res.data
                setTitle(a.title)
                setContent(a.content)
                setCategory(a.category || '')
                setExcerpt(a.excerpt || '')
            }).catch(err => {
                console.error('加载文章失败:', err)
            })
        }
    }, [id])

    // 提交表单
    async function submit(e) {
        e.preventDefault()
        if (!title.trim()) {
            alert('请输入文章标题')
            return
        }
        setIsSubmitting(true)
        try {
            const payload = { title, content, category, excerpt }
            if (id) {
                await axios.put(`/api/articles/${id}`, payload)
            } else {
                await axios.post('/api/articles', payload)
            }
            r.push('/admin/dashboard')
        } catch (err) {
            console.error('提交失败:', err)
            alert('提交失败，请稍后重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id ? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="标题"
                    required
                />
                <input
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="摘要（可选）"
                />
                <input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="分类（可选）"
                />

                {/* 富文本编辑器 */}
                {isLoadingEditor ? (
                    <div className="border rounded p-8 text-center text-gray-500 bg-gray-50">
                        加载编辑器中...
                    </div>
                ) : modules ? (
                    <div className="border rounded p-2">
                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            placeholder="请输入文章内容..."
                        />
                    </div>
                ) : (
                    <div className="border rounded p-8 text-center text-red-500 bg-red-50">
                        编辑器加载失败，请刷新页面重试
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '提交中...' : '发布'}
                    </button>
                    <button
                        type="button"
                        className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                        onClick={() => r.push('/admin/dashboard')}
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    )
}
