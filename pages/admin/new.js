import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import 'quill/dist/quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';

// 动态导入ReactQuill组件，不包含任何初始化逻辑
const ReactQuillBase = dynamic(
    () => import('react-quill').then(mod => mod.default),
    { ssr: false, loading: () => <div>加载中...</div> }
);

// 封装编辑器组件，确保正确初始化
const QuillEditor = ({ value, onChange }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const quillRef = useRef(null);

    // 在组件挂载后初始化Quill和表格模块
    useEffect(() => {
        const initQuill = async () => {
            try {
                // 先加载Quill核心
                const Quill = (await import('quill')).default;
                setTimeout(async () => {

                    // 再加载并注册表格模块
                    const { default: QuillBetterTable } = await import('quill-better-table');

                    // 确保只注册一次
                    if (!Quill.imports['modules/better_table']) {
                        Quill.register('modules/better_table', QuillBetterTable);
                    }

                    // 全局暴露Quill，供react-quill使用
                    window.Quill = Quill;
                    setEditorLoaded(true);
                }, 0.5);
            } catch (error) {
                console.error('初始化Quill失败:', error);
            }
        };

        initQuill();
    }, []);

    // 编辑器模块配置
    const modules = {
        better_table: true,
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            [{ 'table': ['insert', 'delete'] }]
        ]
    };

    // 格式配置
    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'link', 'image',
        'table', 'better_table'
    ];

    if (!editorLoaded) {
        return <div className="p-4 text-center text-gray-500">编辑器加载中...</div>;
    }

    return (
        <ReactQuillBase
            ref={quillRef}
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            theme="snow"
            className="border rounded"
        />
    );
};

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
                setTitle(a.title);
                setContent(a.content);
                setCategory(a.category || '');
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

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id ? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border"
                    placeholder="标题"
                    required
                />
                <input
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full p-2 border"
                    placeholder="摘要（可选）"
                />
                <input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 border"
                    placeholder="分类（可选）"
                />
                <QuillEditor value={content} onChange={setContent} />
                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
