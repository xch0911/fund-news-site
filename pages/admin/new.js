import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Quill from 'quill'
import QuillBetterTable from 'quill-better-table'
import 'react-quill/dist/quill.snow.css'
import 'quill-better-table/dist/quill-better-table.css'

// 注册表格模块
Quill.register(
    {
        'modules/better-table': QuillBetterTable
    },
    true
)

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function NewArticle() {
    const r = useRouter()
    const { id } = r.query
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [excerpt, setExcerpt] = useState('')

    useEffect(() => {
        if (id) {
            axios.get(`/api/articles/${id}`).then(res => {
                const a = res.data
                setTitle(a.title)
                setContent(a.content)
                setCategory(a.category || '')
                setExcerpt(a.excerpt || '')
            })
        }
    }, [id])

    async function submit(e) {
        e.preventDefault()
        const payload = { title, content, category, excerpt }
        if (id) await axios.put(`/api/articles/${id}`, payload)
        else await axios.post('/api/articles', payload)
        r.push('/admin/dashboard')
    }

    const modules = {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ header: [1, 2, 3, false] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
                ['table'] // 让工具栏出现表格按钮
            ],
            handlers: {
                table() {
                    const tableModule = this.quill.getModule('better-table')
                    tableModule.insertTable(3, 3) // 默认插入 3x3 表格
                }
            }
        },
        'better-table': {
            operationMenu: {
                items: {
                    insertColumnRight: { text: '右插列' },
                    insertColumnLeft: { text: '左插列' },
                    insertRowUp: { text: '上插行' },
                    insertRowDown: { text: '下插行' },
                    mergeCells: { text: '合并单元格' },
                    unmergeCells: { text: '取消合并' },
                    deleteColumn: { text: '删除列' },
                    deleteRow: { text: '删除行' },
                    deleteTable: { text: '删除表格' }
                }
            }
        },
        keyboard: {
            bindings: QuillBetterTable.keyboardBindings
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id ? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border" placeholder="标题" />
                <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full p-2 border" placeholder="摘要（可选）" />
                <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border" placeholder="分类（可选）" />
                <ReactQuill value={content} onChange={setContent} modules={modules} />
                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
