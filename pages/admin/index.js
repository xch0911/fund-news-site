import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'

export default function AdminLogin(){
  const [u,setU] = useState('')
  const [p,setP] = useState('')
  const r = useRouter()

  async function submit(e){
    e.preventDefault()
    try{
      await axios.post('/api/auth/login',{ username:u, password:p })
      r.push('/admin/dashboard')
    }catch(err){
      alert('登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="p-6 bg-white rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">管理员登录</h2>
        <input value={u} onChange={e=>setU(e.target.value)} className="w-full p-2 border mb-3" placeholder="用户名" />
        <input value={p} onChange={e=>setP(e.target.value)} type="password" className="w-full p-2 border mb-3" placeholder="密码" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">登录</button>
      </form>
    </div>
  )
}
