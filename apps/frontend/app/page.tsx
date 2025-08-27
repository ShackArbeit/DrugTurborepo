import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card,CardHeader,CardTitle,CardContent,CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {Scale,FolderSearch,FlaskConical,LogIn,PcCase} from 'lucide-react'
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
      <main className=' relative min-h-[100dvh] overflow-hidden
        bg-background text-foreground'
        aria-label='臺灣高等檢察署數位鑑識首頁'
        >
         <div 
         aria-hidden
         className='absolute inset-0 pointer-events-none'
         style={{
          background:
            "radial-gradient(60rem 30rem at 50% -10%, hsl(var(--primary)/0.08), transparent 60%)",
         }}
         />
          <div
           aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))/0.15_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))/0.15_1px,transparent_1px)] bg-[size:44px_44px]"
         />
         {/* 內容容器部分 */}
         <div className='relative z-10 mx-auto max-w-5xl px-6 sm:py-10 '>
          {/* Header 部分 */}
            <header className=" flex flex-col items-center text-center ">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
              <Scale className="h-10 w-10 text-primary" aria-hidden />
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              臺灣高等檢察署數位鑑識首頁
            </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                提供案件資料、鑑識結果及權限式登入入口。
              </p>
             <p className='mt-2 text-pretty text-sm leading-6 text-muted-foreground sm:text-base'>
                模式變更    <ModeToggle/>
             </p>
              <Separator className="mt-8 w-24 opacity-60" />
          </header>
          {/* 主要內容區塊 */}
          <section
          className='mt-12 grid sm:grid-cols-3  gap-5'
           aria-label="快速導引"
          >
            {/* 案件相關 */}
          <Card className='group hover:shadow-lg transition-shadow relative '>
               <CardHeader className='space-y-2 text-center'>
                    <div className='relative bottom-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 m-auto'>
                         <FolderSearch className="h-5 w-5 text-primary" aria-hidden/>
                    </div>
                    <CardTitle className="text-lg">案件相關</CardTitle>
                    <CardDescription>新增、更新、刪除、查詢案件資料</CardDescription>
               </CardHeader>
               <CardContent>
                   <Button asChild className='w-full'>
                        <Link href="/case" aria-label="前往案件相關頁">
                               前往案件頁面
                        </Link>
                   </Button>
               </CardContent>
          </Card>
          {/* 證物相關 */}
          <Card className='group hover:shadow-lg transition-shadow relative'>
               <CardHeader className='space-y-2 text-center'>
                    <div className='relative bottom-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 m-auto'>
                         <PcCase className="h-5 w-5 text-primary" aria-hidden/>
                    </div>
                    <CardTitle className="text-lg">證物相關</CardTitle>
                    <CardDescription>新增、更新、刪除、查詢證物資料</CardDescription>
               </CardHeader>
               <CardContent>
                   <Button asChild className='w-full' variant="secondary">
                        <Link href="/evidence" aria-label="前往案件相關頁">
                               前往證物頁面
                        </Link>
                   </Button>
               </CardContent>
          </Card>
           {/* 使用者登入 */}
          <Card className="group hover:shadow-lg transition-shadow md:col-span-1 sm:col-span-2 md:col-span-1 relative">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 m-auto">
                <LogIn className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">使用者登入</CardTitle>
              <CardDescription>以帳號密碼登入（支援 JWT）</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild  className="w-full">
                <Link href="/login" aria-label="前往登入頁">
                  登入
                </Link>
              </Button>
            </CardContent>
          </Card>    
          </section>
           {/* 版權/腳註 */}
          <footer className="mt-16 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} 臺灣高等檢察署 · 數位鑑識系統
          </footer>
         </div>
      </main>
  );
}
