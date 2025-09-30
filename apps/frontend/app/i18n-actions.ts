'use server'

import { cookies } from "next/headers"

export async function  setLocaleCookie(locale:'zh-TW'|'en'){
      const Cook=await cookies()
      Cook.set('NEXT_LOCALE', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365
       })
}
