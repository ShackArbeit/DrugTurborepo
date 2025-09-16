'use client';
import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useApolloClient } from '@apollo/client';
import {FORGOT_PASSWORD_MUTATION} from '../../lib/graphql/Password'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import Swal from 'sweetalert2';

export const dynamic = 'force-dynamic';


function ForgotPasswordForm() {
  const router = useRouter();
  const client = useApolloClient();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [forgetpassword, { loading, error }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await forgetpassword({ variables: { forgotPasswordInput: { username, email } } });
      if(data?.forgotPassword){
         await client.resetStore()
          await Swal.fire({
          icon: 'success',
          title: '重設密碼信件已寄出',
          text: '請檢查您的電子郵件，依照指示重設密碼。',
          confirmButtonText: '了解',
          confirmButtonColor: '#16a34a',
         });
        router.push('/login');
      }else{
           await Swal.fire({
             icon: 'error',
             title: '發送失敗',
             text: '無法寄送重設密碼信件，請確認帳號與 Email 是否正確。',
            confirmButtonText: '關閉',
        });
      }
      
    } catch (err:any) {
      console.error(err);
       await Swal.fire({
        icon: 'error',
        title: '發送失敗',
        text: err.message || '發送過程發生錯誤，請稍後再試。',
        confirmButtonText: '關閉',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">忘記密碼</CardTitle>
        </CardHeader>
        <p className='m-auto'>請輸入帳號及電子信箱以獲取重設的 URL</p>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" >帳號</Label>
              <Input className='mt-4' id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">電子信箱</Label>
              <Input className='mt-4' id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '整理中...' : '送出'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
          載入中…
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
