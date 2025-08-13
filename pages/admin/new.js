import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import 'quill/dist/quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';

// 确保版本兼容性：建议使用这些版本
// npm install quill@1.3.7 quill-better-table@1.2.8

// 动态导入ReactQuill组件
const ReactQuillBase = dynamic(
    () => import('react-quill').then(mod => mod.default),
    { ssr: false, loading: () => <div>加载中...</div> }
);

const QuillEditor = ({ value, onChange }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [quillInstance, setQuillInstance] = useState(null);
    const quillRef = useRef(null);
    const containerRef = useRef(null);

    // 初始化Quill和表格模块
    useEffect(() => {
        let isMounted = true;

        const initQuill = async () => {
            try {
                // 1. 先加载Quill核心库
                const { default: Quill } = await import('quill');

                // 2. 等待Quill完全初始化
                await new Promise(resolve => setTimeout(resolve, 100));

                // 3. 加载并注册表格模块
                const { default: QuillBetterTable } = await import('quill-better-table');

                // 确保注册方式正确，使用force:true避免冲突
                Quill.register({
                    'modules/better_table': QuillBetterTable
                }, true);

                // 4. 创建自定义键盘绑定处理
                const Module = Quill.import('core/module');
                class BackspaceFixModule extends Module {
                    constructor(quill, options) {
                        super(quill, options);
                        this.quill = quill;

                        // 确保Backspace绑定存在
                        if (!this.quill.keyboard.bindings[8]) {
                            this.quill.keyboard.addBinding(
                                { key: 8, shiftKey: false }, // Backspace键码是8
                                (range, context) => {
                                    // 执行默认Backspace行为
                                    if (range.length === 0) {
                                        this.quill.deleteText(range.index - 1, 1);
                                    } else {
                                        this.quill.deleteText(range.index, range.length);
                                    }
                                }
                            );
                        }
                    }
                }

                // 注册修复模块
                Quill.register('modules/backspaceFix', BackspaceFixModule);

                // 5. 暴露全局Quill实例
                window.Quill = Quill;

                if (isMounted) {
                    setEditorLoaded(true);
                }
            } catch (error) {
                console.error('初始化Quill失败:', error);
            }
        };

        initQuill();

        return () => {
            isMounted = false;
        };
    }, []);

    // 编辑器模块配置 - 包含修复模块
    const modules = {
        backspaceFix: true, // 启用自定义修复模块
        better_table: {
            operationMenu: {
                items: {
                    insertColumnRight: { text: '右侧插入列' },
                    insertColumnLeft: { text: '左侧插入列' },
                    insertRowUp: { text: '上方插入行' },
                    insertRowDown: { text: '下方插入行' },
                    mergeCells: { text: '合并单元格' },
                    unmergeCells: { text: '拆分单元格' },
                    deleteColumn: { text: '删除列' },
                    deleteRow: { text: '删除行' },
                    deleteTable: { text: '删除表格' }
                }
            }
        },
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
            [{ 'table': ['insert', 'delete'] }]
        ],
        // 使用Quill默认键盘配置，不覆盖
        keyboard: {}
    };

    // 格式配置
    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'link', 'image',
        'table', 'better_table'
    ];

    // 处理编辑器实例
    const handleEditorChange = (content, delta, source, editor) => {
        onChange(content);
        if (!quillInstance) {
            setQuillInstance(editor);
        }
    };

    if (!editorLoaded) {
        return (
            <div ref={containerRef} className="p-4 text-center text-gray-500 border rounded min-h-[300px]">
                编辑器加载中...
            </div>
        );
    }

    return (
        <ReactQuillBase
            ref={quillRef}
            value={value}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            theme="snow"
            className="border rounded min-h-[300px]"
            bounds={containerRef.current || document.body}
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
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (id) {
            axios.get(`/api/articles/${id}`).then(res => {
                const a = res.data
                setTitle(a.title || '');
                setContent(a.content || '');
                setCategory(a.category || '');
                setExcerpt(a.excerpt || '')
            }).catch(err => {
                console.error('加载文章失败:', err);
            });
        }
    }, [id])

    async function submit(e) {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        try {
            const payload = { title, content, category, excerpt };
            if (id) {
                await axios.put(`/api/articles/${id}`, payload);
            } else {
                await axios.post('/api/articles', payload);
            }
            r.push('/admin/dashboard');
        } catch (err) {
            console.error('保存失败:', err);
            alert('保存失败，请重试');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{id ? '编辑文章' : '新建文章'}</h2>
            <form onSubmit={submit} className="space-y-4">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="标题"
                    required
                />
                <input
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="摘要（可选）"
                    maxLength="150"
                />
                <input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="分类（可选）"
                />
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容编辑</label>
                    <QuillEditor value={content} onChange={setContent} />
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {saving ? '保存中...' : '发布'}
                    </button>
                    <button
                        type="button"
                        onClick={() => r.back()}
                        className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    )
}
