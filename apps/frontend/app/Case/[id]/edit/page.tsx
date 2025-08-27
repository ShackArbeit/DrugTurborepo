'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CASE_BY_ID, UPDATE_CASE } from '@/lib/graphql/CaseGql';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Save,
  Undo2,
  TriangleAlert,
  ChevronRight,
  FileText,
  Hash,
  Building2,
  UserRound,
  CalendarClock,
  Gauge,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

// Select
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const phoneRegex = /^[0-9+\-\s]{8,20}$/;

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
  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間需為可被解析的日期字串（例如 ISO）'),
  year: z.coerce
    .number()
    .int('年度需為整數')
    .min(1900, '年度不可小於 1900')
    .max(2100, '年度不可大於 2100'),
  prefixLetter: z.string().optional(),
  satisfaction_levelOne: z.string().optional(),
  satisfaction_levelTwo: z.string().optional(),
  satisfaction_levelThree: z.string().optional(),
  satisfaction_levelFour: z.string().optional(),
  section: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const router = useRouter();

  const { data, loading: qLoading, error } = useQuery(GET_CASE_BY_ID, {
    variables: { id: numericId },
  });
  const [updateCase, { loading: mLoading }] = useMutation(UPDATE_CASE);

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
      satisfaction_levelOne: '',
      satisfaction_levelTwo: '',
      satisfaction_levelThree: '',
      satisfaction_levelFour: '',
      createdAt: '',
      year: new Date().getFullYear(),
      prefixLetter: '',
      section: '',
    },
    mode: 'onBlur',
  });

  const c = data?.case;

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
        satisfaction_levelOne: (c as any)?.satisfaction_levelOne ?? '',
        satisfaction_levelTwo: (c as any)?.satisfaction_levelTwo ?? '',
        satisfaction_levelThree: (c as any)?.satisfaction_levelThree ?? '',
        satisfaction_levelFour: (c as any)?.satisfaction_levelFour ?? '',
        createdAt: c.createdAt ?? '',
        year: Number(c.year ?? new Date().getFullYear()),
        prefixLetter: c.prefixLetter ?? '',
        section: c.section ?? '',
      });
    }
  }, [c, form]);

  const onSubmit = async (v: FormValues) => {
    try {
      await updateCase({
        variables: { id: numericId, input: { ...v } },
        refetchQueries: [{ query: GET_CASE_BY_ID, variables: { id: numericId } }],
        awaitRefetchQueries: true,
      });
      router.push(`/case/${id}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? '更新失敗，請稍後再試');
    }
  };

  // 共用：輸入/選擇器的漂亮樣式
  const inputClass =
    'h-10 rounded-2xl border border-input bg-background/60 dark:bg-slate-900/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none transition-colors';

  const selectTriggerClass = 'w-full rounded-2xl ';

  return (
    <>
      {/* 頂部工具列：半透明 + 模糊 + 細邊線 */}
      <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/case" className="transition-colors hover:text-foreground hover:underline">
              案件列表
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link href={`/case/${id}`} className="transition-colors hover:text-foreground hover:underline">
              案件詳情
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">編輯</span>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/case">返回列表</Link>
            </Button>
            {/* 直接提交表單（關聯 form id） */}
            <Button type="submit" form="edit-case-form" disabled={mLoading} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              {mLoading ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容區 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {qLoading && (
          <Card className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl border border-border/60 bg-muted/60" />
                ))}
              </div>
              <div className="h-28 rounded-2xl border border-border/60 bg-muted/60" />
            </div>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription className="break-words">
              {String(error.message)}
            </AlertDescription>
          </Alert>
        )}

        {!qLoading && !error && (
          <Card className="rounded-3xl border border-border/60 shadow-sm bg-gradient-to-b from-card/80 to-background/60 backdrop-blur">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <FileText className="h-5 w-5 opacity-80" />
                編輯案件
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                更新案件基本資訊與送件人資料。標示 <span className="font-semibold text-foreground">*</span> 為必填。
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form id="edit-case-form" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-10">
                  {/* 區塊一：基本識別 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                      基本識別
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="caseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>案件編號 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="例：113-北-000123"
                                {...field}
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caseName"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>案件摘要 *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="輸入案件摘要/描述…"
                                {...field}
                                className="min-h-28 rounded-2xl border border-input bg-background/60 dark:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none shadow-inner shadow-black/[0.03] transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="dark:bg-gray-800" />

                  {/* 區塊二：編號屬性 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      編號屬性
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                className={inputClass}
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
                                className={inputClass}
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
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="dark:bg-gray-800" />

                  {/* 區塊三：類型與時間 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      類型與時間
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                className={inputClass}
                              />
                            </FormControl>
                            <FormDescription>請使用可被 Date.parse 解析的格式</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="dark:bg-gray-800" />

                  {/* 區塊四：送件資訊 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      送件資訊
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                className={inputClass}
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
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="submitterPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 opacity-70" />
                              手機 *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="例：0912-345-678"
                                {...field}
                                className={inputClass}
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
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  {/* 區塊五：服務滿意度 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      服務滿意度
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* 案件承辦速度 */}
                      <FormField
                        control={form.control}
                        name="satisfaction_levelOne"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>案件承辦速度</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectGroup>
                                  <SelectLabel>評分</SelectLabel>
                                  <SelectItem value="很滿意">很滿意</SelectItem>
                                  <SelectItem value="滿意">滿意</SelectItem>
                                  <SelectItem value="普通">普通</SelectItem>
                                  <SelectItem value="有點不滿意">有點不滿意</SelectItem>
                                  <SelectItem value="非常不滿意">非常不滿意</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 證物處理準確性 */}
                      <FormField
                        control={form.control}
                        name="satisfaction_levelTwo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>證物處理準確性</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="很滿意">很滿意</SelectItem>
                                <SelectItem value="滿意">滿意</SelectItem>
                                <SelectItem value="普通">普通</SelectItem>
                                <SelectItem value="有點不滿意">有點不滿意</SelectItem>
                                <SelectItem value="非常不滿意">非常不滿意</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 行政人員服務態度 */}
                      <FormField
                        control={form.control}
                        name="satisfaction_levelThree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>行政人員服務態度</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="很滿意">很滿意</SelectItem>
                                <SelectItem value="滿意">滿意</SelectItem>
                                <SelectItem value="普通">普通</SelectItem>
                                <SelectItem value="有點不滿意">有點不滿意</SelectItem>
                                <SelectItem value="非常不滿意">非常不滿意</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 符合貴單位要求 */}
                      <FormField
                        control={form.control}
                        name="satisfaction_levelFour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>符合貴單位要求</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="很滿意">很滿意</SelectItem>
                                <SelectItem value="滿意">滿意</SelectItem>
                                <SelectItem value="普通">普通</SelectItem>
                                <SelectItem value="有點不滿意">有點不滿意</SelectItem>
                                <SelectItem value="非常不滿意">非常不滿意</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </CardContent>

                <Separator className="dark:bg-gray-800 mb-5" />

                <CardFooter className="flex flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-center dark:bg-slate-900/40 rounded-b-3xl">
                  <Button type="submit" disabled={mLoading} className="gap-2 rounded-xl">
                    <Save className="h-4 w-4" />
                    {mLoading ? '儲存中…' : '儲存'}
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
                        satisfaction_levelOne: (c as any)?.satisfaction_levelOne ?? '',
                        satisfaction_levelTwo: (c as any)?.satisfaction_levelTwo ?? '',
                        satisfaction_levelThree: (c as any)?.satisfaction_levelThree ?? '',
                        satisfaction_levelFour: (c as any)?.satisfaction_levelFour ?? '',
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
          </Card>
        )}
      </div>
    </>
  );
}
