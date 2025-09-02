'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';

import { CREATE_EVIDENCE } from '@/lib/graphql/EvidenceGql';
import { GET_ALL_CAESE, CASE_BY_CASE_NUMBER } from '@/lib/graphql/CaseGql';

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
import { Loader2, TriangleAlert, Save, ChevronRight } from 'lucide-react';

import { uploadImage } from '@/lib/uploadImage';
import LiveCameraCapture from '@/lib/LiveCameraCapture';
import Link from 'next/link';

/** 只保留最近 300 天案件，並依建立時間新→舊排序 */
function filterRecentCases(cases: any[] = []) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 300);
  return cases
    .filter((c) => {
      const t = Date.parse(c.createdAt);
      return !Number.isNaN(t) && new Date(t) >= cutoff;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** 表單驗證 */
const schema = z.object({
  caseNumber: z.string().min(1, '請選擇對應案件'),
  evidenceNumber: z.string().min(1, '證物編號為必填'),
  evidenceType: z.string().min(1, '證物類型為必填'),
  evidenceBrand: z.string().min(1, '證物廠牌為必填'),
  evidenceSerialNo: z.string().optional(),
  evidenceOriginalNo: z.string().optional(),
  deliveryName: z.string().min(1, '交付證物人姓名為必填'),
  receiverName: z.string().min(1, '接受證物鑑識人員姓名為必填'),
  deliveryName2: z.string().min(1, '返回證物者為必填'),
  receiverName2: z.string().min(1, '原單位領回者為必填'),
  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間格式需為 ISO 或可被解析的日期字串'),
  is_Pickup: z.boolean().default(false),
  is_rejected: z.boolean().default(false),
  is_beyond_scope: z.boolean().default(false),
  is_lab_related: z.boolean().default(false),
  is_info_complete: z.boolean().default(false),
  photoFront: z.any(),
  photoBack: z.any(),
  photoFront2: z.any(),
  photoBack2: z.any(),
});

type FormValues = z.infer<typeof schema>;

export default function EvidenceNewPage() {
  const router = useRouter();

  /** 1) 案件清單（下拉選） */
  const {
    data: casesData,
    loading: casesLoading,
    error: casesError,
  } = useQuery(GET_ALL_CAESE);
  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  /** 2) 建立證物 */
  const [createEvidence, { loading: creating }] = useMutation(CREATE_EVIDENCE);

  /** 3) 依 caseNumber 查單一案件（拿 evidenceCount） */
  const [fetchCaseByCaseNumber, { data: caseOneData, loading: oneLoading }] = useLazyQuery(
    CASE_BY_CASE_NUMBER,
    { fetchPolicy: 'network-only' }
  );

  /** 4) RHF 表單 */
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: '',
      evidenceNumber: '',
      evidenceType: '',
      evidenceBrand: '',
      evidenceSerialNo: '',
      evidenceOriginalNo: '',
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


  const selectedCaseNumber = form.watch('caseNumber');
  useEffect(() => {
    if (!selectedCaseNumber) return;
    fetchCaseByCaseNumber({ variables: { caseNumber: selectedCaseNumber } });
  }, [selectedCaseNumber, fetchCaseByCaseNumber]);


  useEffect(() => {
    const cn = selectedCaseNumber;
    const ec = caseOneData?.caseByCaseNumber?.evidenceCount;
    if (!cn || typeof ec !== 'number') return;

    const auto = `EVID-${cn}-${ec + 1}`;
    const state = form.getFieldState('evidenceNumber');
    if (!state.isDirty) {
      form.setValue('evidenceNumber', auto, { shouldDirty: false, shouldValidate: true });
    }
  }, [caseOneData, selectedCaseNumber, form]);

  const ensureUrl = async (v: any) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (v instanceof File) return uploadImage(v);
    return '';
  };


  const onSubmit = async (v: FormValues) => {
    try {
      const [pf, pb, pf2, pb2] = await Promise.all([
        ensureUrl(v.photoFront),
        ensureUrl(v.photoBack),
        ensureUrl(v.photoFront2),
        ensureUrl(v.photoBack2),
      ]);

      if (!pf || !pb || !pf2 || !pb2) {
        alert('四張照片皆為必填');
        return;
      }

      const { data } = await createEvidence({
        variables: {
          input: {
            caseNumber: v.caseNumber,
            createdAt: v.createdAt,
            deliveryName: v.deliveryName,
            receiverName: v.receiverName,
            deliveryName2: v.deliveryName2,
            receiverName2: v.receiverName2,
            evidenceBrand: v.evidenceBrand,
            evidenceNumber: v.evidenceNumber,
            evidenceOriginalNo: v.evidenceOriginalNo,
            evidenceSerialNo: v.evidenceSerialNo,
            evidenceType: v.evidenceType,
            is_Pickup: v.is_Pickup,
            is_rejected: v.is_rejected,
            is_beyond_scope: v.is_beyond_scope,
            is_lab_related: v.is_lab_related,
            is_info_complete: v.is_info_complete,
            photoFront: pf,
            photoBack: pb,
            photoFront2: pf2,
            photoBack2: pb2,
          },
        },
      });

      const id = data?.createEvidence?.id;
      router.push(id ? `/evidence/${id}` : '/evidence');
    } catch (err: any) {
      alert(err?.message ?? '建立失敗，請稍後再試');
    }
  };

  return (
    <>
      {/* Sticky 工具列 */}
      <div className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/evidence" className="hover:underline">
              證物列表
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">新增證物</span>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/evidence">返回列表</Link>
            </Button>
            <Button type="submit" form="evidence-new-form" disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {creating ? '送出中…' : '送出'}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {casesError && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>無法取得案件清單</AlertTitle>
            <AlertDescription className="break-words">{String(casesError.message)}</AlertDescription>
          </Alert>
        )}

        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">新增證物</CardTitle>
            <CardDescription>選擇案件後自動產生證物編號；相機擷取即時預覽，上傳成功回傳 URL。</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="evidence-new-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 區塊一：對應案件 */}
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
                            <SelectTrigger>
                              <SelectValue placeholder="請選擇（僅顯示 300 天內）" />
                            </SelectTrigger>
                            <SelectContent>
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

                <Separator />

                {/* 區塊二：基本資訊（四個欄位，明確寫出，不用 map） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">基本資訊</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* 1. 證物編號（自動帶入） */}
                    <FormField
                      control={form.control}
                      name="evidenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物編號 *</FormLabel>
                          <FormControl>
                            <Input placeholder="EVID-2025xxxx-1" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            {oneLoading
                              ? '計算編號中…'
                              : selectedCaseNumber && caseOneData?.caseByCaseNumber
                              ? `將預設為：EVID-${selectedCaseNumber}-${(caseOneData.caseByCaseNumber.evidenceCount ?? 0) + 1}`
                              : '請先選擇對應案件，系統會自動生成編號'}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 2. 證物類型 */}
                    <FormField
                      control={form.control}
                      name="evidenceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物類型 *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="請選擇案件類型…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="個人桌上型電腦">個人桌上型電腦</SelectItem>
                                <SelectItem value="筆記型電腦">筆記型電腦</SelectItem>
                                <SelectItem value="硬碟">硬碟</SelectItem>
                                <SelectItem value="隨身碟">隨身碟</SelectItem>
                                <SelectItem value="蘋果手機">蘋果手機</SelectItem>
                                <SelectItem value="安卓手機">安卓手機</SelectItem>
                                <SelectItem value="記憶卡">記憶卡</SelectItem>
                                <SelectItem value="光碟">光碟</SelectItem>
                                <SelectItem value="平板電腦">平板電腦</SelectItem>
                                <SelectItem value="其他">其他</SelectItem>
                              </SelectContent>
                            </Select>
                          
                          </FormControl>
                          <FormMessage className="text-xs text-muted-foreground" >    
                               請選擇證物類型
                            </FormMessage>
                        </FormItem>
                      )}
                    />

                    {/* 3. 證物廠牌 */}
                    <FormField
                      control={form.control}
                      name="evidenceBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>證物廠牌 *</FormLabel>
                          <FormControl>
                            <Input placeholder="Apple / ASUS / SanDisk…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 4. 廠牌序號（可選） */}
                    <FormField
                      control={form.control}
                      name="evidenceSerialNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>廠牌序號（可選）</FormLabel>
                          <FormControl>
                            <Input placeholder="SN-XXXX-01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 原始標籤編號（可選）：佔一整列 */}
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

                {/* 區塊三：交付與接收（四個必填） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">交付與接收</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>交付人 *</FormLabel>
                          <FormControl>
                            <Input placeholder="王小明" {...field} />
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
                          <FormLabel>接收人 *</FormLabel>
                          <FormControl>
                            <Input placeholder="趙技佐" {...field} />
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
                          <FormLabel>返回證物者 *</FormLabel>
                          <FormControl>
                            <Input placeholder="李大華" {...field} />
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
                          <FormLabel>原單位領回者 *</FormLabel>
                          <FormControl>
                            <Input placeholder="林技士" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* 區塊四：照片（相機擷取） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">照片（相機擷取）</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* 區塊五：時間與狀態（示例僅 createdAt） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">時間與狀態</h3>
                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>建立時間（ISO）*</FormLabel>
                        <FormControl>
                          <Input placeholder="2025-08-20T10:00:00.000Z" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </CardContent>

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
