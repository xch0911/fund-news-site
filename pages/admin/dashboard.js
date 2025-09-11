import useSWR from 'swr'
import Link from 'next/link'
import axios from 'axios'
import { useState } from 'react'
import withAuth from '../components/withAuth'  // 导入权限组件

function Dashboard() {
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 20  // 每页显示20条数据

    // 使用SWR获取数据，添加页码参数
    const { data, mutate } = useSWR(`/api/articles?page=${currentPage}&pageSize=${PAGE_SIZE}`)

    // 处理删除操作
    async function del(id) {
        if (!confirm('确定删除？')) return
        try {
            await axios.delete(`/api/articles/${id}`)
            // 删除后重新获取当前页数据，而不是刷新整个页面
            mutate()
        } catch (error) {
            alert('删除失败：' + (error.response?.data?.message || error.message))
        }
    }

    // 计算总页数
    const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

    // 页码变更处理
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
        // 滚动到页面顶部
        window.scrollTo(0, 0)
    }

    // 渲染分页导航
    const renderPagination = () => {
        return (
            <div className="flex justify-center mt-6">
              <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 mx-1 rounded border disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                上一页
              </button>

                {/* 显示页码，只显示当前页前后2页和首尾页 */}
                {currentPage > 2 && (
                    <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 mx-1 rounded border hover:bg-gray-100"
                    >
                      1
                    </button>
                )}

                {currentPage > 3 && <span className="px-2">...</span>}

                {currentPage > 1 && (
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1 mx-1 rounded border hover:bg-gray-100"
                    >
                        {currentPage - 1}
                    </button>
                )}

              <button
                  className="px-3 py-1 mx-1 rounded border bg-blue-500 text-white"
              >
                  {currentPage}
              </button>

                {currentPage < totalPages && (
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1 mx-1 rounded border hover:bg-gray-100"
                    >
                        {currentPage + 1}
                    </button>
                )}

                {currentPage < totalPages - 2 && <span className="px-2">...</span>}

                {currentPage < totalPages - 1 && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 mx-1 rounded border hover:bg-gray-100"
                    >
                        {totalPages}
                    </button>
                )}

              <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 mx-1 rounded border disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                下一页
              </button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">管理后台</h1>
            <Link href="/admin/new">
              <a className="px-3 py-1 border rounded hover:bg-gray-100">写文章</a>
            </Link>
          </header>

          <table className="w-full bg-white rounded shadow">
            <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3">标题</th>
              <th className="p-3">分类</th>
              <th className="p-3">创建时间</th>
              <th className="p-3">操作</th>
            </tr>
            </thead>
            <tbody>
            {data?.articles?.length > 0 ? (
                data.articles.map(a => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{a.title}</td>
                <td className="p-3">{a.category || '-'}</td>
                <td className="p-3">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="p-3">
                <Link href={`/admin/new?id=${a.id}`}>
                <a className="mr-4 text-blue-600 hover:underline">编辑</a>
                </Link>
                <button
                onClick={() => del(a.id)}
                className="text-red-600 hover:underline"
                >
                删除
                </button>
                </td>
                </tr>
                ))
                ) : (
                <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                {data ? '没有文章数据' : '加载中...'}
                </td>
                </tr>
                )}
            </tbody>
          </table>

            {/* 只有当有数据且总页数大于1时显示分页 */}
            {data && totalPages > 1 && renderPagination()}
        </div>
    )
}

export default withAuth(Dashboard)  // 使用权限组件包装