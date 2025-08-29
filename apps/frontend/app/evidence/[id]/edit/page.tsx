'use client';

import { use, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { GET_EVIDENCE_BY_ID, UPDATE_EVIDENCE } from '@/lib/graphql/EvidenceGql';
import { GET_ALL_CAESE } from '@/lib/graphql/CaseGql';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Save, ChevronRight, Loader2, TriangleAlert } from 'lucide-react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';

import LiveCameraCapture from '@/lib/LiveCameraCapture';
import { uploadImage } from '@/lib/uploadImage';

const schema = z.object({
  caseNumber: z.string().min(1),
  evidenceNumber: z.string().min(1),
  evidenceType: z.string().min(1),
  evidenceBrand: z.string().min(1),
  evidenceOriginalNo: z.string().optional(),
  evidenceSerialNo: z.string().optional(),
  deliveryName: z.string().min(1),
  receiverName: z.string().min(1),
  deliveryName2: z.string().optional(),
  receiverName2: z.string().optional(),
  createdAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), '時間格式錯誤'),
  is_Pickup: z.boolean().default(false),
  is_rejected: z.boolean().default(false),
  is_beyond_scope: z.boolean().default(false),
  is_lab_related: z.boolean().default(false),
  is_info_complete: z.boolean().default(false),

  // 照片欄位：用 any 讓 RHF 接 File 或 string
  photoFront: z.any().optional(),
  photoBack: z.any().optional(),
  photoFront2: z.any().optional(),
  photoBack2: z.any().optional(),
});
type FormValues = z.infer<typeof schema>;

function filterRecentCases(cases: any[] = []) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 45);
  return cases
    .filter((c) => {
      const t = Date.parse(c.createdAt);
      return !Number.isNaN(t) && new Date(t) >= cutoff;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export default function EditEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const router = useRouter();

  // 1) 單一證物
  const { data, loading: qLoading, error } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: numericId },
    fetchPolicy: 'cache-and-network',
  });

  // 2) 案件清單（45 天內）
  const { data: casesData, loading: casesLoading, error: casesError } = useQuery(GET_ALL_CAESE, {
    fetchPolicy: 'cache-and-network',
  });
  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  // 3) 更新 mutation
  const [updateEvidence, { loading: mLoading }] = useMutation(UPDATE_EVIDENCE);

  // 4) 表單
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
      createdAt: new Date().toISOString(),
      is_Pickup: false,
      is_rejected: false,
      is_beyond_scope: false,
      is_lab_related: false,
      is_info_complete: false,

      photoFront: undefined,
      photoBack: undefined,
      photoFront2: undefined,
      photoBack2: undefined,
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
      createdAt: e.createdAt ?? new Date().toISOString(),
      is_Pickup: !!e.is_Pickup,
      is_rejected: !!e.is_rejected,
      is_beyond_scope: !!e.is_beyond_scope,
      is_lab_related: !!e.is_lab_related,
      is_info_complete: !!e.is_info_complete,

      // 相片欄位預設不放舊 URL，避免一載入就覆蓋；若不重拍就沿用舊值
      photoFront: undefined,
      photoBack: undefined,
      photoFront2: undefined,
      photoBack2: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e]);

  // File 或 string 轉最終 URL；若沒新檔案就回傳 fallback（沿用舊圖）
  const ensureUrl = async (v: any, fallback?: string) => {
    if (!v) return fallback ?? '';
    if (typeof v === 'string') return v.trim();
    if (v instanceof File) return uploadImage(v); // 上傳到 /api/upload/image
    return fallback ?? '';
  };

  const onSubmit = async (v: FormValues) => {
    try {
      const payload = {
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
        createdAt: v.createdAt,
        is_Pickup: v.is_Pickup,
        is_rejected: v.is_rejected,
        is_beyond_scope: v.is_beyond_scope,
        is_lab_related: v.is_lab_related,
        is_info_complete: v.is_info_complete,

        photoFront: await ensureUrl(v.photoFront, e?.photoFront),
        photoBack: await ensureUrl(v.photoBack, e?.photoBack),
        photoFront2: await ensureUrl(v.photoFront2, e?.photoFront2),
        photoBack2: await ensureUrl(v.photoBack2, e?.photoBack2),
      };

      await updateEvidence({
        variables: { id: numericId, input: payload },
        refetchQueries: [{ query: GET_EVIDENCE_BY_ID, variables: { id: numericId } }],
        awaitRefetchQueries: true,
      });

      router.push(`/evidence/${id}`);
    } catch (err: any) {
      alert(err?.message ?? '更新失敗，請稍後再試');
    }
  };

  if (qLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Card className="rounded-3xl border p-6">
          <div className="animate-pulse h-10 w-48 bg-muted rounded" />
        </Card>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Alert variant="destructive" className="rounded-2xl">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>載入失敗</AlertTitle>
          <AlertDescription className="break-words">{String(error.message)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* 黏性工具列 */}
      <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/evidence" className="hover:underline">證物列表</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link href={`/evidence/${id}`} className="hover:underline">證物詳細內容</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">編輯</span>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href={`/evidence/${id}`}>返回詳細</Link>
            </Button>
            <Button type="submit" form="edit-evidence-form" disabled={mLoading} className="gap-2">
              {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mLoading ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {casesError && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>無法取得案件清單</AlertTitle>
            <AlertDescription className="break-words">{String(casesError.message)}</AlertDescription>
          </Alert>
        )}

        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">編輯證物</CardTitle>
            <CardDescription>如未重新拍攝，將保留原有照片；重新拍攝則於儲存後覆蓋。</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="edit-evidence-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 對應案件 */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">對應案件</h3>
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
                            <SelectTrigger><SelectValue placeholder="請選擇案件（45 天內）" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
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

                {/* 基本資訊 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">基本資訊</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['evidenceNumber', '證物編號 *', 'A-001-E03'],
                      ['evidenceType', '證物類型 *', '手機/筆電'],
                      ['evidenceBrand', '證物廠牌 *', 'Apple / ASUS'],
                      ['evidenceSerialNo', '廠牌序號（可選）', 'SN-A001-01'],
                    ].map(([name, label, ph]) => (
                      <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl><Input placeholder={String(ph)} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    ))}
                    <FormField control={form.control} name="evidenceOriginalNo" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>原始標籤編號（可選）</FormLabel>
                        <FormControl><Input placeholder="TAG-A001-01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </section>

                <Separator />

                {/* 交付與接收 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">交付與接收</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['deliveryName', '交付人姓名 *', '王小明'],
                      ['receiverName', '接收人姓名 *', '趙技佐'],
                      ['deliveryName2', '返回證物者（可選）', '李大華'],
                      ['receiverName2', '原單位領回者（可選）', '林技士'],
                    ].map(([name, label, ph]) => (
                      <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl><Input placeholder={String(ph)} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* 照片（相機擷取） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">照片（相機擷取）</h3>

                  {/* 目前已儲存的照片（若有） */}
                  {e && (e.photoFront || e.photoBack || e.photoFront2 || e.photoBack2) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border p-4">
                      {e.photoFront && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">目前：正面</div>
                          <img src={e.photoFront} alt="正面" className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoBack && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">目前：反面</div>
                          <img src={e.photoBack} alt="反面" className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoFront2 && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">目前：正面 2</div>
                          <img src={e.photoFront2} alt="正面 2" className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoBack2 && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">目前：反面 2</div>
                          <img src={e.photoBack2} alt="反面 2" className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">重新拍攝：按「啟用相機 → 擷取照片」。不重拍將沿用上方「目前照片」。</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller control={form.control} name="photoFront" render={({ field }) => (
                      <FormItem>
                        <FormLabel>正面</FormLabel>
                        <FormControl>
                          <LiveCameraCapture
                            facingMode="environment"
                            onCaptured={(file) => field.onChange(file)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Controller control={form.control} name="photoBack" render={({ field }) => (
                      <FormItem>
                        <FormLabel>反面</FormLabel>
                        <FormControl>
                          <LiveCameraCapture
                            facingMode="environment"
                            onCaptured={(file) => field.onChange(file)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Controller control={form.control} name="photoFront2" render={({ field }) => (
                      <FormItem>
                        <FormLabel>正面 2（可選）</FormLabel>
                        <FormControl>
                          <LiveCameraCapture
                            facingMode="environment"
                            onCaptured={(file) => field.onChange(file)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Controller control={form.control} name="photoBack2" render={({ field }) => (
                      <FormItem>
                        <FormLabel>反面 2（可選）</FormLabel>
                        <FormControl>
                          <LiveCameraCapture
                            facingMode="environment"
                            onCaptured={(file) => field.onChange(file)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </section>

                <Separator />

                {/* 時間與狀態（示範 createdAt；其他布林欄位可照你的原 UI） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">時間與狀態</h3>
                  <FormField control={form.control} name="createdAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>建立時間（ISO）*</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </section>
              </CardContent>

              <CardFooter className="flex gap-2 border-t p-4">
                <Button type="submit" disabled={mLoading} className="gap-2">
                  {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {mLoading ? '儲存中…' : '儲存'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
