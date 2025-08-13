import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'

const ReactQuillDynamic = dynamic(() => import('react-quill'), { ssr: false })

export default function NewArticle() {
    const r = useRouter()
    const { id } = r.query
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [modules, setModules] = useState(null)

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

    useEffect(() => {
        async function loadModules() {
            const Quill = (await import('quill')).default
            const QuillTableBetter = (await import('quill-table-better')).default
            await import('quill-table-better/dist/quill-table-better.css')

            Quill.register({ 'modules/table-better': QuillTableBetter }, true)

            setModules({
                keyboard: {
                    bindings: Quill.import('modules/keyboard').defaults.bindings
                },
                toolbar: {
                    container: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['table-better']
                    ],
                    handlers: {
                        'table-better': function () {
                            const tableModule = this.quill.getModule('table-better')
                            tableModule.insertTable(3, 3)
                        }
                    }
                },
                'table-better': {
                    language: 'en_US',
                    menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                    toolbarTable: true
                }
            })
        }

        if (typeof window !== 'undefined') {
            loadModules()
        }
    }, [])

    async function submit(e) {
        e.preventDefault()
        const payload = { title, content, category, excerpt }
        if (id) await axios.put(`/api/articles/${id}`, payload)
        else await axios.post('/api/articles', payload)
        r.push('/admin/dashboard')
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id ? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border" placeholder="标题" />
                <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full p-2 border" placeholder="摘要（可选）" />
                <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border" placeholder="分类（可选）" />

                {modules ? (
                    <ReactQuillDynamic value={content} onChange={setContent} modules={modules} />
                ) : (
                    <p>编辑器加载中...</p>
                )}

                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
