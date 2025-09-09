'use client'
import React from 'react'
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { REGISTER_MUTATION } from '@/lib/graphql/AuthGql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
      CardFooter,
} from '@/components/ui/card';
import {
      Form,
      FormField,
      FormItem,
      FormLabel,
      FormControl,
      FormMessage,
} from '@/components/ui/form';
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import {useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
      username : z.string().min(3,'帳號至少 3 個字元'),
      password : z.string().min(6,'密碼至少 6 個字元')
})

type FormValues = z.infer<typeof schema>;


const RegisterPage = () => {
      const router = useRouter()
      const [serverError, setServerError] = useState<string | null>('')
      const [registerUser, { loading }] = useMutation(REGISTER_MUTATION)
      const form = useForm<FormValues>({
            resolver:zodResolver(schema),
            defaultValues:{
                 username:'',
                 password:''
            }
      })
      const onSubmit = async(values:FormValues)=>{
            setServerError(null)
            try{
               await registerUser({variables:{data:values}})
               alert('註冊成功將跳轉到登入頁面')
               router.push('/login')
            }catch(err:any){
                setServerError(err.message ?? '註冊失敗，請稍後再試');
               
            }
      }
  return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">註冊帳號</CardTitle>
          <CardDescription>請輸入使用者名稱與密碼建立新帳號。</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>使用者名稱</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入帳號" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="輸入密碼" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-around mt-5">
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? '註冊中…' : '註冊'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/login')}>
                已有帳號？登入
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage