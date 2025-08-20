'use client'

import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { ModeToggle } from "../mode-toggle"
import Link from "next/link"

export default function EvidenceToolbar({
      value,
      onChange
}:{
       value:string,
       onChange:(v:string)=>void
}){
      return (
      <div className="flex items-center justify-between gap-2 py-2">
            <Input
            placeholder="搜尋案件編號 / 案件摘要 / 送件單位 / 送件人"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="max-w-xl"
            />
            <div className="flex items-center gap-2">
            <span className="text-lg">點擊轉換模式</span>
            <ModeToggle />
            </div>
            <Button asChild variant="destructive">
            <Link href="/evidence/new">新增案件</Link>
            </Button>
            <Button asChild  variant="secondary">
            <Link href="/">返回首頁</Link>
            </Button>
    </div>
      )
}