import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function withAuth(Component) {
    return function AuthProtectedRoute(props) {
        const router = useRouter();
        const [user, setUser] = useState(null);
        const [error, setError] = useState(null);
        const [isLoading, setIsLoading] = useState(true);

        // 检查登录状态
        useEffect(() => {
            const checkAuth = async () => {
                try {
                    // 发送请求到me接口
                    const res = await axios.get('/api/auth/me');
                    setUser(res.data.user);
                    setError(null);
                } catch (err) {
                    setError(err);
                    setUser(null);
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuth();
        }, [router.asPath]); // 当路由变化时重新检查

        // 根据登录状态重定向
        useEffect(() => {
            if (!isLoading) {
                // 如果未登录且不在登录页，则重定向到登录页
                if ((!user || error) && router.pathname !== '/admin') {
                    router.replace('/admin');
                }
            }
        }, [user, error, isLoading, router]);

        // 加载中状态
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        // 已登录则渲染受保护组件
        return user ? <Component {...props} user={user} /> : null;
    };
}
