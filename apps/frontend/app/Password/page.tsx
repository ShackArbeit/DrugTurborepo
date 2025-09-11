'use client'
import React from 'react'
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
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
      email:z.string().min(10,'電子信箱至少10個字元'),
})

type FormValues = z.infer<typeof schema>;


const RegisterPage = () => {
      const router = useRouter()
      const [serverError, setServerError] = useState<string | null>('')
      
      const form = useForm<FormValues>({
            resolver:zodResolver(schema),
            defaultValues:{
                 username:'',
                 email:'',
            }
      })
      const onSubmit = async(values:FormValues)=>{
           console.log('Hello World')
      }
  return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">忘記密碼</CardTitle>
          <CardDescription>請輸入使用者名稱與電子信箱以重建密碼。</CardDescription>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-around mt-5">
              <Button type="submit" className="w-full sm:w-auto" >
                       送出
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage