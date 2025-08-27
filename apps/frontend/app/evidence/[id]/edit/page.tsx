'use client';

import { use, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { GET_EVIDENCE_BY_ID, UPDATE_EVIDENCE } from '@/lib/graphql/EvidenceGql';
import { GET_ALL_CAESE } from '@/lib/graphql/CaseGql';

// UI
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
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
import {
  Save,
  ChevronRight,
  Loader2,
  TriangleAlert,
  CaseSensitive,
  Package2,
  UserRound,
  Images,
  FlaskConical,
  Clock4,
  CheckCircle2,
} from 'lucide-react';

// shadcn Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/** ---------------- Zod schema ---------------- */
const schema = z.object({
  caseNumber: z.string().min(1, '請選擇對應案件'),
  evidenceNumber: z.string().min(1, '證物編號為必填'),
  evidenceType: z.string().min(1, '證物類型為必填'),
  evidenceBrand: z.string().min(1, '證物廠牌為必填'),
  evidenceOriginalNo: z.string().optional(),
  evidenceSerialNo: z.string().optional(),
  deliveryName: z.string().min(1, '交付證物人姓名為必填'),
  receiverName: z.string().min(1, '接受證物鑑識人員姓名為必填'),

  deliveryName2: z.string().optional(),
  receiverName2: z.string().optional(),

  photoFront: z.string().min(1, '請提供證物正面照片路徑或 URL'),
  photoBack: z.string().min(1, '請提供證物反面照片路徑或 URL'),
  photoFront2: z.string().optional(),
  photoBack2: z.string().optional(),

  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間格式需為 ISO 或可被解析的日期字串'),

  is_Pickup: z.boolean().default(false),
  is_rejected: z.boolean().default(false),
  is_beyond_scope: z.boolean().default(false),
  is_lab_related: z.boolean().default(false),
  is_info_complete: z.boolean().default(false),
});

export type FormValues = z.infer<typeof schema>;

// 只取 45 天內建立的案件
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

export default function EditEvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numericId = Number(id);
  const router = useRouter();

  // 1) 取得證物
  const { data, loading: qLoading, error } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: numericId },
    fetchPolicy: 'cache-and-network',
  });

  // 2) 取得案件清單
  const {
    data: casesData,
    loading: casesLoading,
    error: casesError,
  } = useQuery(GET_ALL_CAESE, { fetchPolicy: 'cache-and-network' });

  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  // 3) 更新 Mutation
  const [updateEvidence, { loading: mLoading }] = useMutation(UPDATE_EVIDENCE);

  // 4) RHF
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
      deliveryName2: '',
      receiverName2: '',
      photoFront: '',
      photoBack: '',
      photoFront2: '',
      photoBack2: '',
      createdAt: new Date().toISOString(),
      is_Pickup: false,
      is_rejected: false,
      is_beyond_scope: false,
      is_lab_related: false,
      is_info_complete: false,
    },
    mode: 'onBlur',
  });

  const e = data?.evidence;

  useEffect(() => {
    if (!e || form.formState.isDirty) return;
    form.reset({
      caseNumber: e.case?.caseNumber ?? '',
      evidenceNumber: e.evidenceNumber ?? '',
      evidenceType: e.evidenceType ?? '',
      evidenceBrand: e.evidenceBrand ?? '',
      evidenceOriginalNo: e.evidenceOriginalNo ?? '',
      evidenceSerialNo: e.evidenceSerialNo ?? '',
      deliveryName: e.deliveryName ?? '',
      receiverName: e.receiverName ?? '',
      deliveryName2: e.deliveryName2 ?? '',
      receiverName2: e.receiverName2 ?? '',
      photoFront: e.photoFront ?? '',
      photoBack: e.photoBack ?? '',
      photoFront2: e.photoFront2 ?? '',
      photoBack2: e.photoBack2 ?? '',
      createdAt: e.createdAt ?? new Date().toISOString(),
      is_Pickup: !!e.is_Pickup,
      is_rejected: !!e.is_rejected,
      is_beyond_scope: !!e.is_beyond_scope,
      is_lab_related: !!e.is_lab_related,
      is_info_complete: !!e.is_info_complete,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e]);

  const onSubmit = async (v: FormValues) => {
    try {
      await updateEvidence({
        variables: {
          id: numericId,
          input: {
            caseNumber: v.caseNumber,
            evidenceNumber: v.evidenceNumber,
            evidenceType: v.evidenceType,
            evidenceBrand: v.evidenceBrand,
            evidenceOriginalNo: v.evidenceOriginalNo,
            evidenceSerialNo: v.evidenceSerialNo,
            deliveryName: v.deliveryName,
            receiverName: v.receiverName,
            deliveryName2: v.deliveryName2,
            receiverName2: v.receiverName2,
            photoFront: v.photoFront,
            photoBack: v.photoBack,
            photoFront2: v.photoFront2,
            photoBack2: v.photoBack2,
            createdAt: v.createdAt,
            is_Pickup: v.is_Pickup,
            is_rejected: v.is_rejected,
            is_beyond_scope: v.is_beyond_scope,
            is_lab_related: v.is_lab_related,
            is_info_complete: v.is_info_complete,
          },
        },
        refetchQueries: [{ query: GET_EVIDENCE_BY_ID, variables: { id: numericId } }],
        awaitRefetchQueries: true,
      });
      router.push(`/evidence/${id}`);
    } catch (err: any) {
      alert(err?.message ?? '更新失敗，請稍後再試');
    }
  };

  /** 共用樣式：輸入與選擇器 */
  const inputClass =
    'h-10 rounded-2xl border border-input bg-background/60 dark:bg-slate-900/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none transition-colors';
  const selectTriggerClass = 'h-10 w-full rounded-2xl border-input bg-background/60 dark:bg-slate-900/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30';

  /** ---------------- Skeleton / Error ---------------- */
  if (qLoading) {
    return (
      <>
        <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <nav className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">編輯證物</span>
            </nav>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" disabled className="rounded-xl">返回詳細</Button>
              <Button disabled className="gap-2 rounded-xl">
                <Loader2 className="h-4 w-4 animate-spin" />
                載入中…
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          <Card className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="h-10 rounded-2xl bg-muted" />
                <div className="h-10 rounded-2xl bg-muted" />
              </div>
              <div className="h-28 rounded-2xl bg-muted" />
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Alert variant="destructive" className="rounded-2xl">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>載入失敗</AlertTitle>
          <AlertDescription className="break-words">
            {String(error.message)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  /** ---------------- Page ---------------- */
  return (
    <>
      {/* 黏性工具列：Breadcrumbs + 操作 */}
      <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/evidence" className="transition-colors hover:text-foreground hover:underline">
              證物列表
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link href={`/evidence/${id}`} className="transition-colors hover:text-foreground hover:underline">
              證物詳細內容
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">編輯</span>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/evidence/${id}`}>返回詳細</Link>
            </Button>
            <Button type="submit" form="edit-evidence-form" disabled={mLoading} className="gap-2 rounded-xl">
              {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mLoading ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* 案件清單狀態提示 */}
        {casesError && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>無法取得案件清單</AlertTitle>
            <AlertDescription className="break-words">
              {String(casesError.message)}
            </AlertDescription>
          </Alert>
        )}

        <Card className="rounded-3xl border border-border/60 shadow-sm bg-gradient-to-b from-card/80 to-background/60 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">編輯證物</CardTitle>
            <CardDescription className="text-muted-foreground">
              更新證物資訊與狀態。標示 <span className="font-semibold text-foreground">*</span> 為必填。
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="edit-evidence-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 區塊：對應案件 */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CaseSensitive className="h-4 w-4" />
                    對應案件
                  </div>
                  <p className="text-sm text-muted-foreground">僅顯示最近 45 天內建立的案件。</p>

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
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="請選擇案件" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {selectableCases.map((c: any) => (
                                <SelectItem key={c.id} value={c.caseNumber}>
                                  {`${c.caseNumber} — ${c.caseName}（${new Date(
                                    c.createdAt
                                  ).toLocaleDateString()}）`}
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
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Package2 className="h-4 w-4" />
                    基本資訊
                  </div>
                  <p className="text-sm text-muted-foreground">證物編號、類型與廠牌。</p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="evidenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物編號 *</FormLabel>
                          <FormControl>
                            <Input placeholder="例：A-001-E03" {...field} className={inputClass} />
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
                            <Input placeholder="例：手機、筆電、U 盤…" {...field} className={inputClass} />
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
                            <Input placeholder="例：Apple / ASUS / SanDisk…" {...field} className={inputClass} />
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
                            <Input placeholder="例：SN-A001-01" {...field} className={inputClass} />
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
                          <Input placeholder="例：TAG-A001-01" {...field} className={inputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator className="dark:bg-gray-800" />

                {/* 區塊：交付與接收 */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    交付與接收
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>交付人姓名 *</FormLabel>
                          <FormControl>
                            <Input placeholder="例：王小明" {...field} className={inputClass} />
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
                            <Input placeholder="例：趙技佐" {...field} className={inputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryName2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>交付人姓名 2（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="例：李大華" {...field} className={inputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="receiverName2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>接收人姓名 2（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="例：林技士" {...field} className={inputClass} />
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
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Images className="h-4 w-4" />
                    接收證物照片
                  </div>
                  <p className="text-sm text-muted-foreground">提供正面與反面照片的檔案路徑或 URL。</p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="photoFront"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>交付正面照片路徑/URL *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/photos/A-001/E03-front.jpg 或 http(s)://..."
                              {...field}
                              className={`${inputClass} mb-3`}
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
                          <FormLabel>交付反面照片路徑/URL *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/photos/A-001/E03-back.jpg 或 http(s)://..."
                              {...field}
                              className={`${inputClass} mb-3`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="photoFront2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>領回正面照片路徑/URL 2（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="/photos/A-001/E03-front-2.jpg" {...field} className={inputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="photoBack2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>領回反面照片路徑/URL 2（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="/photos/A-001/E03-back-2.jpg" {...field} className={inputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator className="dark:bg-gray-800" />

                {/* 區塊：鑑識狀態（四布林） */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <FlaskConical className="h-4 w-4" />
                    鑑識狀態（完成後）
                  </div>
                  <p className="text-sm text-muted-foreground">以下為鑑識作業結果相關的布林欄位。</p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      { name: 'is_rejected', label: '是否應退件' },
                      { name: 'is_beyond_scope', label: '超出鑑識能力範圍' },
                      { name: 'is_lab_related', label: '是否屬於實驗室鑑識項目' },
                      { name: 'is_info_complete', label: '案件資訊是否完整' },
                    ].map((f) => (
                      <FormField
                        key={f.name}
                        control={form.control}
                        name={f.name as keyof FormValues}
                        render={({ field }) => (
                          <FormItem
                            className={[
                              'flex items-center justify-between gap-4',
                              'rounded-2xl border border-border/60 p-4',
                              'bg-card/60 backdrop-blur',
                              'shadow-sm hover:shadow-md transition-shadow',
                            ].join(' ')}
                          >
                            <FormLabel className="m-0 text-sm md:text-base">{f.label}</FormLabel>
                            <FormControl>
                              <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </section>

                <Separator className="dark:bg-gray-800" />

                {/* 區塊：時間與領回狀態 */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock4 className="h-4 w-4" />
                    時間與領回狀態
                  </div>
                  <p className="text-sm text-muted-foreground">建立時間需可被 Date.parse 解析。</p>

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
                              className={inputClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* is_Pickup 用 Select 映射 boolean */}
                    <Controller
                      control={form.control}
                      name="is_Pickup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 opacity-70" />
                            是否已領回
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? 'true' : 'false'}
                              onValueChange={(val) => field.onChange(val === 'true')}
                            >
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="選擇狀態" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
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

              <CardFooter className="flex flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-center dark:bg-slate-900/40 rounded-b-3xl">
                <Button type="submit" disabled={mLoading} className="gap-2 rounded-xl">
                  {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {mLoading ? '儲存中…' : '儲存'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset(form.getValues())}
                  disabled={mLoading}
                  className="gap-2 rounded-xl"
                >
                  重新整理畫面值
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
