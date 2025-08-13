import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import 'quill/dist/quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';

// 先导入Quill和表格模块，确保全局可用
const loadQuillDependencies = async () => {
    if (typeof window !== 'undefined') {
        const Quill = (await import('quill')).default;
        const { default: QuillBetterTable } = await import('quill-better-table');

        // 确保只注册一次
        if (!Quill.imports['modules/better_table']) {
            Quill.register('modules/better_table', QuillBetterTable);
        }

        return Quill;
    }
    return null;
};

// 动态导入ReactQuill组件
const ReactQuill = dynamic(
    async () => {
        try {
            // 确保依赖已加载
            await loadQuillDependencies();
            const { default: ReactQuillLib } = await import('react-quill');
            return ReactQuillLib;
        } catch (e) {
            console.error('加载失败', e);
            return () => <div>编辑器加载失败</div>;
        }
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

export default function NewArticle() {
    const r = useRouter()
    const { id } = r.query
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [quillLoaded, setQuillLoaded] = useState(false);

    // 确保Quill依赖在组件挂载后加载
    useEffect(() => {
        const initQuill = async () => {
            await loadQuillDependencies();
            setQuillLoaded(true);
        };
        initQuill();
    }, []);

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

    // 配置编辑器模块（包含表格支持）
    const modules = {
        better_table: {
            operationMenu: {
                items: {
                    unmergeCells: {
                        text: '合并单元格'
                    }
                }
            }
        },
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            // 添加表格操作按钮
            [{ 'table': 'insert' }]
        ]
    };

    // 格式配置
    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'link', 'image',
        // 表格相关格式
        'table', 'better_table'
    ];

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
                {quillLoaded && (
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        theme="snow"
                        className="border rounded"
                    />
                )}
                <div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">发布</button>
                </div>
            </form>
        </div>
    )
}
