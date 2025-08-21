'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_EVIDENCE } from '@/lib/graphql/EvidenceGql';
import { GET_ALL_CAESE } from '@/lib/graphql/CaseGql';

// shadcn/ui
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
import Link from 'next/link';

const schema = z.object({
  caseNumber: z.string().min(1, '請選擇對應案件'),
  evidenceNumber: z.string().min(1, '證物編號為必填'),
  evidenceType: z.string().min(1, '證物類型為必填'),
  evidenceBrand: z.string().min(1, '證物廠牌為必填'),
  evidenceOriginalNo: z.string().optional(),
  evidenceSerialNo: z.string().optional(),
  deliveryName: z.string().min(1, '交付證物人姓名為必填'),
  receiverName: z.string().min(1, '接受證物鑑識人員姓名為必填'),
  photoFront: z.string().min(1, '請提供證物正面照片路徑或 URL'),
  photoBack: z.string().min(1, '請提供證物反面照片路徑或 URL'),
  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間格式需為 ISO 或可被解析的日期字串'),
  is_Pickup: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

function filterRecentCases(cases: any[] = []) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 45);
  return cases
    .filter((c) => {
      const t = Date.parse(c.createdAt);
      return !Number.isNaN(t) && new Date(t) >= cutoff;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export default function EvidenceNewPage() {
  const router = useRouter();

  const { data: casesData, loading: casesLoading, error: casesError } = useQuery(GET_ALL_CAESE);
  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  const [createEvidence, { loading: creating }] = useMutation(CREATE_EVIDENCE);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: '',
      evidenceNumber: '',
      evidenceType: '',
      evidenceBrand: '',
      evidenceOriginalNo: '',
      evidenceSerialNo: '',
      deliveryName: '',
      receiverName: '',
      photoFront: '',
      photoBack: '',
      createdAt: new Date().toISOString(),
      is_Pickup: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (v: FormValues) => {
    try {
      const { data } = await createEvidence({ variables: { input: v } });
      const id = data?.createEvidence?.id;
      if (id) router.push(`/evidence/${id}`);
      else router.push('/evidence');
    } catch (err: any) {
      alert(err?.message ?? '建立失敗，請稍後再試');
    }
  };

  return (
    <>
      {/* 黏性工具列：Breadcrumbs + 操作 */}
      <div className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/evidence" className="hover:underline">證物列表</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">新增證物</span>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/evidence">返回列表</Link>
            </Button>
            {/* 直接提交（關聯 form id） */}
            <Button type="submit" form="evidence-new-form" disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {creating ? '送出中…' : '送出'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* 載入／錯誤狀態 */}
        {casesLoading && (
          <Card className="mb-6 rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-10 rounded-md bg-muted" />
                <div className="h-10 rounded-md bg-muted" />
              </div>
            </div>
          </Card>
        )}
        {casesError && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>無法取得案件清單</AlertTitle>
            <AlertDescription className="break-words">
              {String(casesError.message)}
            </AlertDescription>
          </Alert>
        )}

        <Card className="rounded-2xl border bg-gradient-to-b from-white to-gray-50 shadow-sm backdrop-blur dark:from-gray-900 dark:to-gray-900/60">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">新增證物</CardTitle>
            <CardDescription className="text-muted-foreground">
              請填寫下列證物資訊並提交。標示 <span className="font-semibold text-foreground">*</span> 為必填。
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="evidence-new-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 區塊：對應案件 */}
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">對應案件</h3>
                    <p className="text-sm text-muted-foreground">
                      只顯示最近 45 天建立的案件，請選擇一筆作為證物歸屬。
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="caseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>對應案件 *</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={casesLoading || selectableCases.length === 0}
                          >
                            <SelectTrigger className="h-10 w-full rounded-xl border-input bg-background/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-slate-900/60">
                              <SelectValue placeholder="請選擇案件（僅顯示 45 天內建立者）" />
                            </SelectTrigger>
                            <SelectContent>
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

                <Separator className="dark:bg-gray-800" />

                {/* 區塊：基本資訊 */}
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">基本資訊</h3>
                    <p className="text-sm text-muted-foreground">證物編號、類型與廠牌。</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="evidenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物編號 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：A-001-E01"
                              {...field}
                              className="h-10 rounded-xl border-input bg-background/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-slate-900/60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="evidenceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物類型 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：手機、筆電、U 盤…"
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
                      name="evidenceBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物廠牌 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：Apple / ASUS / SanDisk…"
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
                      name="evidenceSerialNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>廠牌序號（可選）</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：SN-XXXX-01"
                              {...field}
                              className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="evidenceOriginalNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>原始標籤編號（可選）</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：TAG-A001-01"
                            {...field}
                            className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator className="dark:bg-gray-800" />

                {/* 區塊：交付與接收 */}
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">交付與接收</h3>
                    <p className="text-sm text-muted-foreground">交付人與接收人姓名。</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>交付人姓名 *</FormLabel>
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
                      name="receiverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>接收人姓名 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：趙技佐"
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

                {/* 區塊：照片 */}
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">照片</h3>
                    <p className="text-sm text-muted-foreground">提供正面與反面照片的檔案路徑或 URL。</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="photoFront"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>正面照片路徑/URL *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/photos/A-001/E01-front.jpg 或 http(s)://..."
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
                      name="photoBack"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>反面照片路徑/URL *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/photos/A-001/E01-back.jpg 或 http(s)://..."
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

                {/* 區塊：時間與狀態 */}
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">時間與狀態</h3>
                    <p className="text-sm text-muted-foreground">建立時間需可被 Date.parse 解析。</p>
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
                              placeholder="例如 2025-08-20T10:00:00.000Z"
                              {...field}
                              className="h-10 rounded-xl bg-background/60 dark:bg-slate-900/60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* is_Pickup 用 shadcn Select，回寫 boolean */}
                    <Controller
                      control={form.control}
                      name="is_Pickup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>是否已領回</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? 'true' : 'false'}
                              onValueChange={(val) => field.onChange(val === 'true')}
                            >
                              <SelectTrigger className="h-10 w-full rounded-xl bg-background/60 dark:bg-slate-900/60">
                                <SelectValue placeholder="選擇狀態" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">尚未領回</SelectItem>
                                <SelectItem value="true">已領回</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-center dark:bg-slate-900/40 rounded-b-2xl">
                <Button type="submit" disabled={creating} className="gap-2 rounded-xl">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {creating ? '送出中…' : '送出'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={creating}
                  className="gap-2 rounded-xl"
                >
                  <Eraser className="h-4 w-4" />
                  清除
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
