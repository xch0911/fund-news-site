import useSWR from 'swr'
import Link from 'next/link'
import axios from 'axios'

export default function Dashboard(){
  const { data } = useSWR('/api/articles')

  async function del(id){
    if(!confirm('确定删除？')) return
    await axios.delete(`/api/articles/${id}`)
    window.location.reload()
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <Link href="/admin/new"><a className="px-3 py-1 border rounded">写文章</a></Link>
      </header>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left">
            <th className="p-3">标题</th>
            <th className="p-3">分类</th>
            <th className="p-3">创建时间</th>
            <th className="p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(a=> (
            <tr key={a.id} className="border-t">
              <td className="p-3">{a.title}</td>
              <td className="p-3">{a.category || '-'}</td>
              <td className="p-3">{new Date(a.createdAt).toLocaleString()}</td>
              <td className="p-3">
                <Link href={`/admin/new?id=${a.id}`}><a className="mr-2">编辑</a></Link>
                <button onClick={()=>del(a.id)} className="text-red-600">删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
