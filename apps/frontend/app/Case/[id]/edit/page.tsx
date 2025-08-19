'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/client'
import { GET_CASE_BY_ID, UPDATE_CASE } from '@/lib/graphql/CaseGql'
import { useRouter } from 'next/navigation'
import { use, useEffect } from 'react'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ModeToggle } from '@/components/mode-toggle'
import { Save, RefreshCw, Undo2, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

const phoneRegex = /^[0-9+\-\s]{8,20}$/
const schema = z.object({
  caseNumber: z.string().min(1, '案件編號為必填'),
  caseType: z.string().min(1, '案件類型為必填'),
  caseName: z.string().min(1, '案件摘要為必填'),
  submitUnit: z.string().min(1, '送件單位為必填'),
  submitterName: z.string().min(1, '送件人姓名為必填'),
  submitterPhone: z
    .string()
    .min(1, '手機為必填')
    .regex(phoneRegex, '手機格式不正確（僅允許數字、+、-、空白，至少 8 碼）'),
  submitterTel: z
    .string()
    .min(1, '市話為必填')
    .regex(phoneRegex, '市話格式不正確（僅允許數字、+、-、空白，至少 8 碼）'),
  submitterSignature: z.string().min(1, '簽名（路徑或 Base64）為必填'),
  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間需為可被解析的日期字串（例如 ISO）'),
  year: z.coerce
    .number()
    .int('年度需為整數')
    .min(1900, '年度不可小於 1900')
    .max(2100, '年度不可大於 2100'),
  prefixLetter: z.string().optional(),
  section: z.string().optional(),
})

export type FormValues = z.infer<typeof schema>

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const numericId = Number(id)
  const router = useRouter()

  const { data, loading: qLoading, error } = useQuery(GET_CASE_BY_ID, {
    variables: { id: numericId },
  })
  const [updateCase, { loading: mLoading }] = useMutation(UPDATE_CASE)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: '',
      caseType: '',
      caseName: '',
      submitUnit: '',
      submitterName: '',
      submitterPhone: '',
      submitterTel: '',
      submitterSignature: '',
      createdAt: '',
      year: new Date().getFullYear(),
      prefixLetter: '',
      section: '',
    },
    mode: 'onBlur',
  })

  const c = data?.case

  useEffect(() => {
    if (c && !form.formState.isDirty) {
      form.reset({
        caseNumber: c.caseNumber ?? '',
        caseType: c.caseType ?? '',
        caseName: c.caseName ?? '',
        submitUnit: c.submitUnit ?? '',
        submitterName: c.submitterName ?? '',
        submitterPhone: c.submitterPhone ?? '',
        submitterTel: c.submitterTel ?? '',
        submitterSignature: c.submitterSignature ?? '',
        createdAt: c.createdAt ?? '',
        year: Number(c.year ?? new Date().getFullYear()),
        prefixLetter: c.prefixLetter ?? '',
        section: c.section ?? '',
      })
    }
  }, [c, form])

  const onSubmit = async (v: FormValues) => {
    try {
      await updateCase({
        variables: { id: numericId, input: { ...v } },
        refetchQueries: [{ query: GET_CASE_BY_ID, variables: { id: numericId } }],
        awaitRefetchQueries: true,
      })
      router.push(`/case/${id}`)
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? '更新失敗，請稍後再試')
    }
  }

  return (
   <>
   <div className='w-full flex mt-3 justify-around'>
      <p className='mx-4'>點擊轉換模式<ModeToggle/></p>
      <Button asChild >
              <Link href="/case">返回列表</Link>
      </Button>
    </div>
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-muted/30 to-background dark:from-slate-950 dark:to-slate-950 py-8 px-4">
      <Card className="mx-auto w-full max-w-4xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm dark:shadow-slate-900/30 rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">編輯案件</CardTitle>
          <CardDescription className="text-muted-foreground">
            更新案件基本資訊與送件人資料。欄位標示 * 為必填。
          </CardDescription>
        </CardHeader>

        {qLoading && (
          <div className="px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-9 w-1/2 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded-md bg-muted" />
                ))}
              </div>
              <div className="h-28 rounded-md bg-muted" />
            </div>
          </div>
        )}

        {error && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>載入失敗</AlertTitle>
              <AlertDescription className="break-words">
                {String(error.message)}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!qLoading && !error && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* 編號 */}
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">案件編號 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例：113-北-000123"
                          {...field}
                          className="h-10 rounded-xl border-input bg-background/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-slate-900/60"
                        />
                      </FormControl>
                      <FormDescription>建議格式：年度-冠字-流水號</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 年度/冠字/股別 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年度 *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="例：2025"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prefixLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>冠字（可選）</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：北、桃、刑…"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>股別（可選）</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：偵二、鑑識股…"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* 類型/建立時間 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>案件類型 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：毒品、詐欺、車禍…"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>建立時間（ISO）*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例如 2025-08-14T10:00:00.000Z"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormDescription>請使用可被 Date.parse 解析的格式</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 摘要 */}
                <FormField
                  control={form.control}
                  name="caseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>案件摘要 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="輸入案件摘要/描述…"
                          {...field}
                          className="min-h-28 rounded-xl bg-background/60 dark:bg-slate-900/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* 送件單位/姓名 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>送件單位 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：某某分局偵查隊"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="submitterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>送件人姓名 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：王小明"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 連絡電話 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手機 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：0912-345-678"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="submitterTel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>市話 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：02-1234-5678"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 簽名 */}
                <FormField
                  control={form.control}
                  name="submitterSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>簽名（圖檔路徑/Base64）*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例：/uploads/sign/xxx.png 或 data:image/png;base64,..."
                          {...field}
                          className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

           <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center border-t bg-muted/40 dark:bg-slate-900/40 rounded-b-2xl p-4">
                <Button type="submit" disabled={mLoading} className="gap-2 rounded-xl">
                  <Save className="h-4 w-4" />
                  {mLoading ? '儲存中…' : '儲存'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset(form.getValues())}
                  disabled={mLoading}
                  className="gap-2 rounded-xl"
                >
                  <RefreshCw className="h-4 w-4" />
                  還原目前輸入
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    c &&
                    form.reset({
                      caseNumber: c.caseNumber ?? '',
                      caseType: c.caseType ?? '',
                      caseName: c.caseName ?? '',
                      submitUnit: c.submitUnit ?? '',
                      submitterName: c.submitterName ?? '',
                      submitterPhone: c.submitterPhone ?? '',
                      submitterTel: c.submitterTel ?? '',
                      submitterSignature: c.submitterSignature ?? '',
                      createdAt: c.createdAt ?? '',
                      year: Number(c.year ?? new Date().getFullYear()),
                      prefixLetter: c.prefixLetter ?? '',
                      section: c.section ?? '',
                    })
                  }
                  disabled={mLoading}
                  className="gap-2 rounded-xl"
                >
                  <Undo2 className="h-4 w-4" />
                  還原成資料值
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
    </>
  )
}
