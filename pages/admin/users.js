import useSWR from 'swr'
import axios from 'axios'
import { useState } from 'react'
import withAuth from '../components/withAuth'  // 导入权限组件

function Users(){
  const { data: users, mutate } = useSWR('/api/users')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [role, setRole] = useState('editor')

  async function create(){
    await axios.post('/api/users', { username: u, password: p, role })
    setU(''); setP(''); setRole('editor')
    mutate()
  }

  async function del(id){
    if(!confirm('确定删除？')) return
    await axios.delete(`/api/users/${id}`)
    mutate()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">管理员与编辑管理</h1>
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h3 className="font-semibold">添加用户</h3>
        <input value={u} onChange={e=>setU(e.target.value)} className="border p-2 mr-2" placeholder="用户名" />
        <input value={p} onChange={e=>setP(e.target.value)} className="border p-2 mr-2" placeholder="密码" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="border p-2 mr-2">
          <option value="editor">editor</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={create} className="px-3 py-1 bg-blue-600 text-white rounded">创建</button>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead><tr><th className="p-3">用户名</th><th>角色</th><th>操作</th></tr></thead>
          <tbody>
            {users?.map(u=> (
              <tr key={u.id} className="border-t"><td className="p-3">{u.username}</td><td>{u.role}</td><td className="p-3"><button onClick={()=>del(u.id)} className="text-red-600">删除</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default withAuth(Users)  // 使用权限组件包装