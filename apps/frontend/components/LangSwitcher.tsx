'use client'
import {useTransition} from 'react';
import { setLocaleCookie } from '@/app/i18n-actions';
import { useRouter } from 'next/navigation';

export default function LangSwitcher(){
  const [pending, startTransition] = useTransition();
  const router = useRouter()

  const change = (next:'zh-TW' | 'en'|'de')=>{
    startTransition(async()=>{
      await setLocaleCookie(next)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3">
      <button
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold 
        bg-gradient-to-r from-indigo-500 to-purple-500 
        text-white shadow-md shadow-indigo-300/40
        transition-all duration-300 
        hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/60
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={pending}
        onClick={() => change('zh-TW')}
      >
        中文
      </button>

 
      <button
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold 
        bg-gradient-to-r from-emerald-500 to-teal-500 
        text-white shadow-md shadow-emerald-300/40
        transition-all duration-300 
        hover:scale-105 hover:shadow-lg hover:shadow-emerald-400/60
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={pending}
        onClick={() => change('en')}
      >
        English
      </button>

      
      <button
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold 
        bg-gradient-to-r from-amber-500 to-orange-500 
        text-white shadow-md shadow-amber-300/40
        transition-all duration-300 
        hover:scale-105 hover:shadow-lg hover:shadow-orange-400/60
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={pending}
        onClick={() => change('de')}
      >
        Deutsch
      </button>
    </div>
  )
}
