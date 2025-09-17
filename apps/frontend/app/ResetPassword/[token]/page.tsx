'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import Swal from 'sweetalert2';

// 確認你的 gql 定義長這樣
const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($resetPasswordInput: ResetPasswordInput!) {
    resetPassword(resetPasswordInput: $resetPasswordInput)
  }
`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();   
  const token = params?.token ?? '';
  console.log('Token 是:',token)
  const [newPassword, setNewPassword] = useState('');
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await resetPassword({
        variables: {
          resetPasswordInput: {
            token,
            newPassword,
          },
        },
      });

      if (data?.resetPassword) {
        await Swal.fire({
          icon: 'success',
          title: '密碼已更新',
          confirmButtonText: '前往登入',
          confirmButtonColor: '#16a34a',
        });
        router.push('/login');
      } else {
        await Swal.fire({
          icon: 'error',
          title: '更新失敗',
          text: '重設連結可能已過期，請重新申請。',
        });
      }
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: err?.message ?? '請稍後再試',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">重設密碼</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pwd">新密碼</Label>
              <Input
                id="pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

    
            <input  value={token} readOnly />

            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? '送出中…' : '送出'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
