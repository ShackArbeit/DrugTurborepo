'use client'
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {  useApolloClient } from '@apollo/client';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton({
      className,
      variant = 'outline',
      size = 'lg',
      label = '登出'
}:{
      className?: string;
      variant?: React.ComponentProps<typeof Button>['variant'];
      size?: React.ComponentProps<typeof Button>['size'];
      label?: string;
}){
      const router = useRouter()
      const client = useApolloClient()
      const [loading , setLoading] = useState(false)
      const handleLogout = useCallback(async ()=>{
             try{
                  setLoading(true)
                  if(typeof window!=='undefined'){
                        localStorage.removeItem('token')
                  }
                  await client.clearStore().catch(()=>client.resetStore())
                  router.push('/login')
             }finally{
                  setLoading(false);
             }
      },[client,router])
      return (
            <Button
              type="button"
              variant={variant}
              size={size}
              className={className}
              onClick={handleLogout}
              disabled={loading}
            >
                  <LogOut className="mr-2 h-4 w-4" />
                  {loading?'登出中....':label}
            </Button>
      )

}