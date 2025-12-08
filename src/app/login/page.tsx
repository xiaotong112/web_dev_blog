'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      if (response.code === 200) {
        // Based on docs, login returns token. 
        // We might need to fetch profile separately OR the backend returns user object too.
        // Docs say: POST /api/auth/login -> returns Token.
        // Let's assume we need to fetch profile after login or the login response structure in my service was optimistic.
        // Let's check docs again. Docs didn't explicitly show Login Response body in SUMMARY, but usually it returns token.
        // I'll assume token is returned, then I fetch profile.
        
        // Wait, checking FINAL_IMPLEMENTATION_SUMMARY.md...
        // "3. 配置文件" section shows usage of token.
        // "🧪 测试建议" shows: curl ... /api/auth/login ...
        // It doesn't explicitly show the JSON response structure for login in the summary, 
        // but typically it is { code: 200, data: "token_string" } or { code: 200, data: { token: "..." } }
        
        // If the API returns just the token string or object, I should probably fetch the profile immediately after.
        
        let token = '';
        // If data is string
        if (typeof response.data === 'string') {
            token = response.data;
        } else if (typeof response.data === 'object' && (response.data as any).token) {
            token = (response.data as any).token;
        } else {
             // Fallback or assume the data IS the token?
             // Let's assume standard JWT response. 
             // If I need to be sure, I can check `USER_MODULE_IMPLEMENTATION.md` again logic flow.
             // It says "用户请求 -> JWT认证 -> ...".
             // Actually, `CREATOR_CENTER_API_GUIDE.md` says: `Authorization: Bearer <TOKEN>`
             // It doesn't show the login response format.
             // I will assume it returns a token string or object. I will handle both?
             // Actually most standard field is `token`.
             token = (response.data as any).token || (response.data as any);
        }

        // Set token temporarily to allow getProfile to work
        localStorage.setItem('token', token);
        
        // Fetch User Profile
        const profileRes = await authService.getProfile();
        if (profileRes.code === 200) {
            login(profileRes.data, token);
            toast.success('Welcome back!');
            router.push('/');
        } else {
            toast.error('Failed to load profile');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Error handling is done in interceptor mostly, but simple fallback here
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                type="text"
                placeholder="Username"
                required
                className="pl-10"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                type="password"
                placeholder="Password"
                required
                className="pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign in
          </Button>
          
          <div className="text-center text-sm">
             <span className="text-zinc-500">Don't have an account? </span>
             <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
               Sign up
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
