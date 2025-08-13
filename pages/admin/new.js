import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// 动态导入 ReactQuill（保持 ssr: false）
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// 声明变量用于后续存储 Quill 和表格模块（避免服务端报错）
let Quill
let TableModule, TableToolbar

export default function NewArticle() {
    const r = useRouter()
    const { id } = r.query
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [modules, setModules] = useState(null) // 动态初始化工具栏配置

    // 仅在客户端加载 Quill 和表格模块（useEffect 在服务端不执行）
    useEffect(() => {
        // 动态导入 Quill 和 quill-better-table（客户端环境）
        import('quill').then(quillModule => {
            Quill = quillModule.default
            return Promise.all([
                import('quill-better-table'),
                import('quill-better-table/dist/quill-better-table.css')
            ])
        }).then(([tableModule]) => {
            // 提取表格模块
            TableModule = tableModule.TableModule
            TableToolbar = tableModule.TableToolbar

            // 注册表格模块（仅在客户端执行）
            Quill.register({
                'modules/table': TableModule,
                'formats/table': TableModule.tableFormat,
                'formats/cell': TableModule.cellFormat,
                'formats/row': TableModule.rowFormat,
                'modules/tableToolbar': TableToolbar
            }, true)

            // 配置工具栏（包含表格按钮）
            setModules({
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['table'] // 表格按钮
                ],
                table: true,
                tableToolbar: true
            })
        })
    }, [])

    // 其余代码保持不变（useEffect 加载文章、submit 提交逻辑等）
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
              {/* 输入框部分保持不变 */}
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
              {/* 富文本编辑器：确保 modules 加载完成后再渲染 */}
              {modules && (
                  <div className="border rounded p-2">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        placeholder="请输入文章内容..."
                    />
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
