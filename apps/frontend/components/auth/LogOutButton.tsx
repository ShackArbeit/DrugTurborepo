'use client'
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {  useApolloClient } from '@apollo/client';
import { Button } from '../ui/button';
import { LogOut ,LogIn} from 'lucide-react';
import Link from 'next/link';
import { GET_ME } from '@/lib/graphql/AuthGql';


type Props = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  label?: string;
};


export default function LogoutButton({
      className,
      variant = 'outline',
      size = 'lg',
      label = '登出'
}:Props){
     const router = useRouter()
     const client = useApolloClient()
     const token =typeof window !== 'undefined' ? localStorage.getItem('token') : null;
     const { data , loading , error} = useQuery(GET_ME,{
        skip:!token,
         fetchPolicy: 'network-only',
     })
     if(!token){
        return (
              <Button asChild variant={variant} size={size} className={className}>
                  <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                        登入
                  </Link>
            </Button>
        )
     }
     if (loading || error) return null; 
      const username = data?.me?.username;
      const handleLogout= async () =>{
              if (typeof window !== 'undefined') 
              {
                  localStorage.removeItem('token');
                  document.cookie = `token=; Path=/; Max-Age=0; SameSite=Lax`;
            }
              
              await client.clearStore().catch(()=>client.resetStore())
              router.push('/')
      }

      return (
            <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogout}
            aria-label={username ? `登出 ${username}` : '登出'}
    >
         <LogOut className="mr-2 h-4 w-4" />
            登出
        </Button>
      )

}