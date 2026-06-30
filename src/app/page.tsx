// 首页 - 显示用户登录状态

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取当前用户信息
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        router.push('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('登出失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {user ? '欢迎回来' : 'Cloudflare 认证系统'}
          </CardTitle>
          <CardDescription>
            {user ? `${user.username}` : '请登录或注册您的账号'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">用户 ID:</span> {user.id}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">邮箱:</span> {user.email}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">用户名:</span> {user.username}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">注册时间:</span> {new Date(user.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <Button onClick={handleLogout} variant="destructive" className="w-full">
                登出
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">登录</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}