'use client'

export function RoleBadge({role}:{role:'user'|'admin'|string}){
      const styles = role ==='amdin'?'bg-red-100 text-red-700 border-red-200':'bg-blue-100 text-blue-700 border-blue-200'
      return (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
            >
                  {role}
            </span>
      )
}