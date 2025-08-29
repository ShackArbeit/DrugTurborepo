'use client'; 
// 指定這是 Next.js App Router 的「用戶端元件」：需要在瀏覽器端使用相機、表單、路由等前端 API

import { z } from 'zod'; 
// zod：宣告與驗證表單資料結構與型別

import { zodResolver } from '@hookform/resolvers/zod'; 
// 將 zod schema 接到 react-hook-form 的 resolver，讓表單驗證自動依 schema 執行

import { useForm, Controller } from 'react-hook-form'; 
// useForm：建立/控制整個表單
// Controller：用於「非原生 input」或自訂元件（如相機元件）把值接回 RHF 的受控流程

import { useMutation, useQuery } from '@apollo/client'; 
// Apollo Hooks：useQuery 查資料、useMutation 送資料

import { useRouter } from 'next/navigation'; 
// Next.js App Router 的前端路由 Hook：做頁面導向（push）

import { CREATE_EVIDENCE } from '@/lib/graphql/EvidenceGql'; 
// GraphQL Mutation：建立證物

import { GET_ALL_CAESE } from '@/lib/graphql/CaseGql'; 
// GraphQL Query：取得所有案件（命名看起來像是 CASES 的誤植，但保持原樣）

// shadcn/ui 各種 UI 元件：按鈕、輸入框、表單容器、下拉選單、卡片、警示、分隔線、主題切換等
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/mode-toggle';
import { Loader2, TriangleAlert, Save, Eraser, ChevronRight } from 'lucide-react';
// lucide-react：icon 套件（Loader2 旋轉、警示三角形、儲存、橡皮擦、> 符號等）

import { uploadImage } from '@/lib/uploadImage'; 
// 自訂的檔案上傳函式：把 File 上傳後回傳 URL（字串）

import LiveCameraCapture from '@/lib/LiveCameraCapture'; 
// 你的相機擷取元件：擷取後回傳 File

import Link from 'next/link'; 
// Next.js 的客戶端連結元件（避免整頁 reload）

// --- 小工具：過濾 45 天內的案件，且依建立時間新到舊排序 ---
function filterRecentCases(cases: any[] = []) {
  const cutoff = new Date();                 // 取得現在時間
  cutoff.setDate(cutoff.getDate() - 45);     // 往前推 45 天作為門檻
  return cases
    .filter((c) => {
      const t = Date.parse(c.createdAt);     // 解析每筆案件的 createdAt
      return !Number.isNaN(t) && new Date(t) >= cutoff; // 有效日期且在 45 天內
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)); 
    // 依 createdAt 由新到舊排序
}

// --- 表單驗證 Schema（zod） ---
// 定義每個欄位的型別與必填規則，react-hook-form 會透過 resolver 自動驗證
const schema = z.object({
  caseNumber: z.string().min(1),                     // 必填
  evidenceNumber: z.string().min(1),                 // 必填
  evidenceType: z.string().min(1),                   // 必填
  evidenceBrand: z.string().min(1),                  // 必填
  evidenceSerialNo: z.string().optional(),           // 可選
  evidenceOriginalNo: z.string().optional(),         // 可選
  deliveryName: z.string().min(1),                   // 必填
  receiverName: z.string().min(1),                   // 必填
  deliveryName2: z.string().min(1),                  // 必填（領回）
  receiverName2: z.string().min(1),                  // 必填（領回）
  createdAt: z.string().refine((v) => !Number.isNaN(Date.parse(v))), 
  // createdAt 必須是可被 Date.parse 解析的字串（ISO 格式或其他可解析格式）

  is_Pickup: z.boolean().default(false),             // 布林，預設 false
  is_rejected: z.boolean().default(false),           // 布林，預設 false
  is_beyond_scope: z.boolean().default(false),       // 布林，預設 false
  is_lab_related: z.boolean().default(false),        // 布林，預設 false
  is_info_complete: z.boolean().default(false),      // 布林，預設 false

  photoFront: z.any(),    // 照片：這裡用 any 接，實務可能是 File 或 URL 字串
  photoBack: z.any(),
  photoFront2: z.any(),
  photoBack2: z.any(),
});

type FormValues = z.infer<typeof schema>; 
// 從 zod schema 自動推導表單的 TypeScript 型別（避免手動重複定義）

export default function EvidenceNewPage() {
  const router = useRouter(); 
  // 前端路由控制（push/replace/back 等）

  // 取得案件清單（用於選擇關聯案件）
  // data：請求結果；loading：載入中；error：錯誤物件
  const { data: casesData, loading: casesLoading, error: casesError } = useQuery(GET_ALL_CAESE);

  // 只取 45 天內的案件並排序，避免下拉太多歷史資料
  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  // 建立「新增證物」的 mutation 函式 createEvidence；creating：是否請求中
  const [createEvidence, { loading: creating }] = useMutation(CREATE_EVIDENCE);

  // 建立 react-hook-form 表單實例
  const form = useForm<FormValues>({
    resolver: zodResolver(schema), // 掛上 zod 驗證
    defaultValues: {               // 預設值（避免非受控轉受控警告）
      caseNumber: '', evidenceNumber: '', evidenceType: '', evidenceBrand: '',
      evidenceSerialNo: '', evidenceOriginalNo: '',
      deliveryName: '', receiverName: '', deliveryName2: '', receiverName2: '',
      createdAt: new Date().toISOString(), // 預設現在時間的 ISO 字串
      is_Pickup: false, is_rejected: false, is_beyond_scope: false, is_lab_related: false, is_info_complete: false,
      photoFront: undefined, photoBack: undefined, photoFront2: undefined, photoBack2: undefined,
    },
    mode: 'onBlur', // 驗證觸發時機：欄位 blur 時驗證（也可用 onChange / onSubmit 依需求調整）
  });

  // 小工具：把「可能是 File 或字串」的欄位統一換成「URL 字串」
  // - 若是 File：呼叫 uploadImage 上傳並取得 URL
  // - 若是字串：trim 後直接回傳
  // - 若是空值：回傳空字串（代表未填）
  const ensureUrl = async (v: any) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (v instanceof File) return uploadImage(v);
    return '';
  }

  // 表單送出事件：處理資料 → 上傳照片（如需要）→ 呼叫 GraphQL 建立 → 導向詳細頁
  const onSubmit = async (v: FormValues) => {
    try {
      // 并行處理四張圖片：每張如果是 File 就上傳換 URL，若已是字串就直接使用
      const [pf, pb, pf2, pb2] = await Promise.all([
        ensureUrl(v.photoFront), ensureUrl(v.photoBack), ensureUrl(v.photoFront2), ensureUrl(v.photoBack2)
      ]);

      // 檢查四張照片都有值（必填）
      if (!pb || !pf || !pf2 || !pb2) {
        { alert('四張照片皆為必填'); return; }
      }

      // 呼叫 GraphQL Mutation：建立證物
      // 這裡的 input 欄位名稱需與後端 GraphQL schema 對應
      const { data } = await createEvidence({
        variables: {
          input: {
            caseNumber: v.caseNumber, createdAt: v.createdAt,
            deliveryName: v.deliveryName, receiverName: v.receiverName,
            deliveryName2: v.deliveryName2, receiverName2: v.receiverName2,
            evidenceBrand: v.evidenceBrand, evidenceNumber: v.evidenceNumber,
            evidenceOriginalNo: v.evidenceOriginalNo, evidenceSerialNo: v.evidenceSerialNo,
            evidenceType: v.evidenceType,
            is_Pickup: v.is_Pickup, is_rejected: v.is_rejected,
            is_beyond_scope: v.is_beyond_scope, is_lab_related: v.is_lab_related, is_info_complete: v.is_info_complete,
            photoFront: pf, photoBack: pb, photoFront2: pf2, photoBack2: pb2,
          },
        }
      });

      // 從回傳資料中取新建立的 id，導向 /evidence/[id] 詳細頁；若沒有 id 則退回列表
      const id = data?.createEvidence?.id;
      router.push(id ? `/evidence/${id}` : '/evidence');
    } catch (err: any) {
      // 將錯誤訊息顯示給使用者
      alert(err?.message ?? '建立失敗，請稍後再試');
    }
  };

  return (
    <>
      {/* --- Sticky 工具列（頂部導覽 & 送出鍵）--- */}
      <div className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          {/* 麵包屑導覽：返回列表 → 新增證物 */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/evidence" className="hover:underline">證物列表</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">新增證物</span>
          </nav>

          {/* 右側工具：深淺色切換、返回列表、送出表單 */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            {/* asChild：讓 Button 包裹 Link 時使用 Link 的元素作為實際 DOM（避免重複按鈕語意） */}
            <Button asChild variant="outline">
              <Link href="/evidence">返回列表</Link>
            </Button>

            {/* 這顆按鈕會觸發下方 form 的 submit（透過 form 屬性綁定 id） */}
            <Button
              type="submit"
              form="evidence-new-form"
              disabled={creating}
              className="gap-2"
            >
              {/* creating 期間顯示轉圈圖示 */}
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {creating ? '送出中…' : '送出'}
            </Button>
          </div>
        </div>
      </div>

      {/* --- 主內容容器 --- */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* 案件清單若抓取失敗，顯示 destructive 警示框 */}
        {casesError && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>無法取得案件清單</AlertTitle>
            <AlertDescription className="break-words">
              {String(casesError.message)}
            </AlertDescription>
          </Alert>
        )}

        {/* 卡片：包住整個表單 */}
        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">新增證物</CardTitle>
            <CardDescription>
              相機擷取後即時預覽，上傳成功會回傳 URL 存進後端。
            </CardDescription>
          </CardHeader>

          {/* shadcn 的 Form 容器，將 form 實例傳下去 */}
          <Form {...form}>
            {/* 綁定 onSubmit：透過 RHF 的 handleSubmit 包進去 */}
            <form id="evidence-new-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 區塊一：對應案件（45 天內） */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">對應案件</h3>
                  <FormField
                    control={form.control}
                    name="caseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>對應案件 *</FormLabel>
                        <FormControl>
                          {/* 這裡用 Select（非原生 input），直接把 onValueChange 接 RHF 的 field.onChange */}
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={casesLoading || selectableCases.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="請選擇（45天內）" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* 將可選案件渲染為 <SelectItem>，value 存 caseNumber */}
                              {selectableCases.map((c: any) => (
                                <SelectItem key={c.id} value={c.caseNumber}>
                                  {`${c.caseNumber} — ${c.caseName}（${new Date(c.createdAt).toLocaleDateString()}）`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator />

                {/* 區塊二：基本資訊（證物屬性） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">基本資訊</h3>

                  {/* 以 grid 兩欄排版；用 map 產同構欄位，避免重複碼 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['evidenceNumber','證物編號 *','A-001-E01'],
                      ['evidenceType','證物類型 *','手機/筆電…'],
                      ['evidenceBrand','證物廠牌 *','Apple/ASUS…'],
                      ['evidenceSerialNo','廠牌序號（可選）','SN-XXXX-01'],
                    ].map(([name, label, ph]) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              {/* Input 與 RHF 的 field 綁定 */}
                              <Input placeholder={String(ph)} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    {/* 原始標籤編號：獨立為一整列（md:col-span-2） */}
                    <FormField
                      control={form.control}
                      name="evidenceOriginalNo"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>原始標籤編號（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="TAG-A001-01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* 區塊三：交付與接收（四個必填人名） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">交付與接收</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['deliveryName','交付人 *','王小明'],
                      ['receiverName','接收人 *','趙技佐'],
                      ['deliveryName2','返回證物者 *','李大華'],
                      ['receiverName2','原單位領回者 *','林技士'],
                    ].map(([name, label, ph]) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input placeholder={String(ph)} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </section>

                <Separator />

                {/* 區塊四：照片（相機擷取） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">照片（相機擷取）</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* 這裡用 Controller，因為 LiveCameraCapture 不是原生 input；需手動把 onCaptured(file) 餵回 RHF 的 field.onChange */}
                  <Controller
                    control={form.control}
                    name="photoFront"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>正面 *</FormLabel>
                        <FormControl>
                          <LiveCameraCapture onCaptured={(file) => field.onChange(file)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="photoBack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>反面 *</FormLabel>
                        <FormControl>
                          <LiveCameraCapture onCaptured={(file) => field.onChange(file)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                  {/* 第二組（領回用）的正反面照，兩欄排版 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      control={form.control}
                      name="photoFront2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>正面 2（領回）*</FormLabel>
                          <FormControl>
                            <LiveCameraCapture onCaptured={(file) => field.onChange(file)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="photoBack2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>反面 2（領回）*</FormLabel>
                          <FormControl>
                            <LiveCameraCapture onCaptured={(file) => field.onChange(file)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* 區塊五：時間與狀態（此示例只放 createdAt；布林旗標可再加 switch/checkbox 群組） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">時間與狀態</h3>
                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>建立時間（ISO）*</FormLabel>
                        <FormControl>
                          {/* 直接輸入 ISO 字串；也可換成 datetime-local 並在送出轉 ISO */}
                          <Input placeholder="2025-08-20T10:00:00.000Z" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </CardContent>

              {/* 卡片底部：送出按鈕（與頂部一致，這裡是讓長頁面底部也能送） */}
              <CardFooter className="flex gap-2 border-t p-4">
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {creating ? '送出中…' : '送出'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
