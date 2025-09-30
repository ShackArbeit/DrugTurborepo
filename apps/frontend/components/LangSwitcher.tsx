'use client'
import {useTransition} from 'react';
import { setLocaleCookie } from '@/app/i18n-actions';
import { useRouter } from 'next/navigation';

export default function LangSwitcher(){
  const [pending, startTransition] = useTransition();
  const router = useRouter()

  const change = (next:'zh-TW' | 'en')=>{
    startTransition(async()=>{
      await setLocaleCookie(next)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3">
      <button
        className={`rounded-lg px-4 py-2 text-sm font-medium 
    bg-gradient-to-r from-indigo-500 to-purple-500 
    text-white shadow-sm transition-all duration-300 
    hover:from-indigo-600 hover:to-purple-600 
    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
  disabled={pending}
  onClick={() => change('zh-TW')}
      >
        中文
      </button>
      <button
      className={`rounded-lg px-4 py-2 text-sm font-medium 
    bg-gradient-to-r from-emerald-500 to-teal-500 
    text-white shadow-sm transition-all duration-300 
    hover:from-emerald-600 hover:to-teal-600 
    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
  disabled={pending}
  onClick={() => change('en')}
      >
        English
      </button>
    </div>
  )
}
