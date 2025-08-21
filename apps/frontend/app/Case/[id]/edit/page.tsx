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
import { Save, RefreshCw, Undo2, TriangleAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
      submitterSignature: '',
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
        submitterSignature: c.submitterSignature ?? '',
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

  return (
    <>
      <div className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/case" className="hover:underline">案件列表</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link href={`/case/${id}`} className="hover:underline">案件詳情</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">編輯</span>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/case">返回列表</Link>
            </Button>
            {/* 直接提交表單（關聯 form id） */}
            <Button type="submit" form="edit-case-form" disabled={mLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {mLoading ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容區 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {qLoading && (
          <Card className="rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded-md bg-muted" />
                ))}
              </div>
              <div className="h-28 rounded-md bg-muted" />
            </div>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription className="break-words">
              {String(error.message)}
            </AlertDescription>
          </Alert>
        )}

        {!qLoading && !error && (
          <Card className="rounded-2xl border bg-gradient-to-b from-white to-gray-50 shadow-sm backdrop-blur dark:from-gray-900 dark:to-gray-900/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
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
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">基本識別</h3>
                      <p className="text-sm text-muted-foreground">
                        案件編號與摘要等識別資訊。
                      </p>
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
                                className="h-10 rounded-xl border-input bg-background/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-slate-900/60"
                              />
                            </FormControl>
                            <FormDescription>建議格式：年度-冠字-流水號</FormDescription>
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
                                className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
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
                                className="min-h-28 rounded-xl bg-background/60 dark:bg-slate-900/60"
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
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">編號屬性</h3>
                      <p className="text-sm text-muted-foreground">年度、冠字與股別。</p>
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
                  </section>

                  <Separator className="dark:bg-gray-800" />

                  {/* 區塊三：類型與時間 */}
                  <section className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">類型與時間</h3>
                      <p className="text-sm text-muted-foreground">建立時間需能被 Date.parse 解析。</p>
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
                                className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
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
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">送件資訊</h3>
                      <p className="text-sm text-muted-foreground">送件單位、送件人與聯絡方式。</p>
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
                  </section>

                  <Separator className="dark:bg-gray-800" />

                  {/* 區塊五：簽名 */}
                  <section className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">簽名</h3>
                      <p className="text-sm text-muted-foreground">可提供圖檔路徑或 Base64 字串。</p>
                    </div>

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
                  </section>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-center dark:bg-slate-900/40 rounded-b-2xl">
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
          </Card>
        )}
      </div>
    </>
  );
}
