import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Quill from 'quill'
import { TableModule, TableToolbar } from 'quill-better-table'
import 'quill-better-table/dist/quill-better-table.css'

// 注册表格模块
Quill.register({
    'modules/table': TableModule,
    'formats/table': TableModule.tableFormat,
    'formats/cell': TableModule.cellFormat,
    'formats/row': TableModule.rowFormat,
    'modules/tableToolbar': TableToolbar
}, true)

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// 配置富文本编辑器模块，包含表格功能
const modules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // 文本格式
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // 标题
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // 列表
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // 缩进
        [{ 'direction': 'rtl' }],                         // 文本方向
        [{ 'size': ['small', false, 'large', 'huge'] }],  // 字体大小
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // 标题
        [{ 'color': [] }, { 'background': [] }],          // 文字颜色和背景色
        [{ 'font': [] }],                                 // 字体
        [{ 'align': [] }],                                // 对齐方式
        ['link', 'image'],                                // 链接和图片
        ['clean'],                                         // 清除格式
        ['table']                                         // 表格功能
    ],
    table: true,
    tableToolbar: true,
    history: {
        userOnly: true
    }
}

export default function NewArticle(){
    const r = useRouter()
    const { id } = r.query
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('')
    const [category,setCategory] = useState('')
    const [excerpt,setExcerpt] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(()=>{
        if(id){
            axios.get(`/api/articles/${id}`).then(res=>{
                const a = res.data
                setTitle(a.title);
                setContent(a.content);
                setCategory(a.category || '');
                setExcerpt(a.excerpt || '')
            }).catch(err => {
                console.error('加载文章失败:', err)
            })
        }
    },[id])

    async function submit(e){
        e.preventDefault()

        // 简单验证
        if(!title.trim()){
            alert('请输入文章标题')
            return
        }

        setIsSubmitting(true)
        try {
            const payload = { title, content, category, excerpt }
            if(id) {
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
          <h2 className="text-2xl font-bold mb-4">{id? '编辑文章' : '新建文章'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <input
                value={title}
                onChange={e=>setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="标题"
                required
            />
            <input
                value={excerpt}
                onChange={e=>setExcerpt(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="摘要（可选）"
            />
            <input
                value={category}
                onChange={e=>setCategory(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="分类（可选）"
            />
            <div className="border rounded p-2">
              <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="请输入文章内容..."
              />
            </div>
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
