import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'

// 动态导入ReactQuill（2.0.0+版本兼容React 18）
const ReactQuillDynamic = dynamic(
    () => import('react-quill').then(mod => mod.default),
    {
        ssr: false,
        loading: () => <p>编辑器加载中...</p>
    }
);

export default function NewArticle() {
    const r = useRouter();
    const { id } = r.query;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [modules, setModules] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const quillRef = useRef(null);
    const quillLoaded = useRef(false);

    // 加载文章数据
    useEffect(() => {
        if (id) {
            axios.get(`/api/articles/${id}`)
                .then(res => {
                    const a = res.data;
                    setTitle(a.title);
                    setContent(a.content);
                    setCategory(a.category || '');
                    setExcerpt(a.excerpt || '');
                })
                .catch(err => console.error('加载文章失败:', err));
        }
    }, [id]);

    // 加载Quill和表格插件
    useEffect(() => {
        if (quillLoaded.current || typeof window === 'undefined') return;
        quillLoaded.current = true;

        const initQuill = async () => {
            try {
                // 1. 先加载并初始化Quill核心
                const { default: Quill } = await import('quill');

                // 2. 加载表格插件
                const { default: QuillTableBetter } = await import('quill-table-better');
                await import('quill-table-better/dist/quill-table-better.css');

                // 3. 注册表格插件
                Quill.register('modules/tableBetter', QuillTableBetter, true);

                // 4. 配置编辑器模块
                setModules({
                    history: {
                        delay: 1000,
                        maxStack: 50,
                        userOnly: false
                    },
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'header': [1, 2, 3, false] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['tableBetter']
                        ],
                        handlers: {
                            'tableBetter': function() {
                                if (this.quill && this.quill.getModule) {
                                    const tableModule = this.quill.getModule('tableBetter');
                                    if (tableModule && typeof tableModule.insertTable === 'function') {
                                        tableModule.insertTable(3, 3);
                                    }
                                }
                            }
                        }
                    },
                    tableBetter: {
                        language: 'en_US',
                        menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                        toolbarTable: true
                    }
                });
            } catch (error) {
                console.error('初始化Quill失败:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initQuill();
    }, []);

    async function submit(e) {
        e.preventDefault();
        try {
            const payload = { title, content, category, excerpt };
            if (id) {
                await axios.put(`/api/articles/${id}`, payload);
            } else {
                await axios.post('/api/articles', payload);
            }
            r.push('/admin/dashboard');
        } catch (err) {
            console.error('提交失败:', err);
            alert('提交失败，请重试');
        }
    }

    if (isLoading) {
        return <div className="max-w-3xl mx-auto p-6">加载编辑器中...</div>;
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

                {modules && (
                    <ReactQuillDynamic
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        theme="snow"
                        className="border rounded p-2 min-h-[300px]"
                        placeholder="请输入文章内容..."
                    />
                )}

                <div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                        发布
                    </button>
                </div>
            </form>
        </div>
    );
}
