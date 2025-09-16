'use client'
import { use } from 'react'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { RESET_PASSWORD_MUTATION } from '@/lib/graphql/Password'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@radix-ui/react-label'


export default function ResetPassword  ({params}:{params:Promise<{token:string}>}) {
      const token = use(params)
      const router = useRouter()
      const [newPassword, setNewPassword] = useState('')
      const [resetPasswordMutation, { loading, error }] = useMutation(RESET_PASSWORD_MUTATION)
      const handleSubmit =async (e:React.FormEvent)=>{
             e.preventDefault()
             await resetPasswordMutation({
                  variables:{newPassword,token}
             })
             router.push('/login')
      }

  return (
     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">重設密碼</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">新密碼</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '處理中…' : '重設密碼'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}




