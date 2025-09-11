// components/withAuth.js
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSWR } from 'swr'
import axios from 'axios'

const fetcher = async () => {
    const res = await axios.get('/api/auth/me')
    return res.data
}

export default function withAuth(Component) {
    return function AuthProtectedRoute(props) {
        const router = useRouter()
        const { data: user, error } = useSWR('/api/auth/me', fetcher)
        const isLoading = !user && !error

        useEffect(() => {
            // 如果未加载完成，不做处理
            if (isLoading) return

            // 如果未登录，重定向到登录页
            if (error || !user) {
                router.replace('/admin')
            }
        }, [user, error, isLoading, router])

        // 加载中显示loading
        if (isLoading) {
            return <div className="flex items-center justify-center min-h-screen">加载中...</div>
        }

        // 已登录则显示组件
        return <Component {...props} />
    }
}
