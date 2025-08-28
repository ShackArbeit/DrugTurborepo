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
import { uploadImage } from '@/lib/uploadImage';
import LiveCameraCapture from '@/lib/LiveCameraCapture';
import Link from 'next/link';

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

const schema = z.object({
  caseNumber: z.string().min(1),
  evidenceNumber: z.string().min(1),
  evidenceType: z.string().min(1),
  evidenceBrand: z.string().min(1),
  evidenceSerialNo: z.string().optional(),
  evidenceOriginalNo: z.string().optional(),
  deliveryName: z.string().min(1),
  receiverName: z.string().min(1),
  deliveryName2: z.string().min(1),   
  receiverName2: z.string().min(1),  
  createdAt: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
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

  const { data: casesData, loading: casesLoading, error: casesError } = useQuery(GET_ALL_CAESE);
  const selectableCases = filterRecentCases(casesData?.cases ?? []);

  const [createEvidence, { loading: creating }] = useMutation(CREATE_EVIDENCE);

   const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: '', evidenceNumber: '', evidenceType: '', evidenceBrand: '',
      evidenceSerialNo: '', evidenceOriginalNo: '',
      deliveryName: '', receiverName: '', deliveryName2: '', receiverName2: '',
      createdAt: new Date().toISOString(),
      is_Pickup: false, is_rejected: false, is_beyond_scope: false, is_lab_related: false, is_info_complete: false,
      photoFront: undefined, photoBack: undefined, photoFront2: undefined, photoBack2: undefined,
    },
    mode: 'onBlur',
  });

  const ensureUrl = async (v:any)=>{
      if(!v) return '';
      if (typeof v === 'string') return v.trim();
      if (v instanceof File) return uploadImage(v)
      return ''
  }


  const onSubmit = async (v: FormValues) => {
    try {
         const [pf,pb,pf2,pb2] = await Promise.all([
              ensureUrl(v.photoFront),ensureUrl(v.photoBack),ensureUrl(v.photoFront2),ensureUrl(v.photoBack2)
         ])
         if(!pb||!pf||!pf2||!pb2){
           { alert('四張照片皆為必填'); return; }
         }
         const {data} = await createEvidence({
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
        }})
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
            <Link href="/evidence" className="hover:underline">證物列表</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">新增證物</span>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline"><Link href="/evidence">返回列表</Link></Button>
            <Button type="submit" form="evidence-new-form" disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {creating ? '送出中…' : '送出'}
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
            <CardDescription>相機擷取後即時預覽，上傳成功會回傳 URL 存進後端。</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="evidence-new-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 對應案件 */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">對應案件</h3>
                  <FormField control={form.control} name="caseNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>對應案件 *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} disabled={casesLoading || selectableCases.length === 0}>
                          <SelectTrigger><SelectValue placeholder="請選擇（45天內）" /></SelectTrigger>
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
                  )}/>
                </section>

                <Separator />

                {/* 基本資訊 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">基本資訊</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['evidenceNumber','證物編號 *','A-001-E01'],
                      ['evidenceType','證物類型 *','手機/筆電…'],
                      ['evidenceBrand','證物廠牌 *','Apple/ASUS…'],
                      ['evidenceSerialNo','廠牌序號（可選）','SN-XXXX-01'],
                    ].map(([name,label,ph])=>(
                      <FormField key={name} control={form.control} name={name as any} render={({field})=>(
                        <FormItem><FormLabel>{label}</FormLabel><FormControl><Input placeholder={String(ph)} {...field}/></FormControl><FormMessage/></FormItem>
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
                      ['deliveryName','交付人 *','王小明'],
                      ['receiverName','接收人 *','趙技佐'],
                      ['deliveryName2','返回證物者 *','李大華'],
                      ['receiverName2','原單位領回者 *','林技士'],
                    ].map(([name,label,ph])=>(
                      <FormField key={name} control={form.control} name={name as any} render={({field})=>(
                        <FormItem><FormLabel>{label}</FormLabel><FormControl><Input placeholder={String(ph)} {...field}/></FormControl><FormMessage/></FormItem>
                      )}/>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* 照片（相機擷取） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">照片（相機擷取）</h3>

                  <Controller control={form.control} name="photoFront" render={({ field }) => (
                    <FormItem>
                      <FormLabel>正面 *</FormLabel>
                      <FormControl><LiveCameraCapture onCaptured={(file)=>field.onChange(file)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <Controller control={form.control} name="photoBack" render={({ field }) => (
                    <FormItem>
                      <FormLabel>反面 *</FormLabel>
                      <FormControl><LiveCameraCapture onCaptured={(file)=>field.onChange(file)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller control={form.control} name="photoFront2" render={({ field }) => (
                      <FormItem>
                        <FormLabel>正面 2（領回）*</FormLabel>
                        <FormControl><LiveCameraCapture onCaptured={(file)=>field.onChange(file)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Controller control={form.control} name="photoBack2" render={({ field }) => (
                      <FormItem>
                        <FormLabel>反面 2（領回）*</FormLabel>
                        <FormControl><LiveCameraCapture onCaptured={(file)=>field.onChange(file)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </section>

                <Separator />

                {/* 時間與狀態（示範 createdAt；布林欄位你可依原 UI 補上） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">時間與狀態</h3>
                  <FormField control={form.control} name="createdAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>建立時間（ISO）*</FormLabel>
                      <FormControl><Input placeholder="2025-08-20T10:00:00.000Z" {...field}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </section>
              </CardContent>

              <CardFooter className="flex gap-2 border-t p-4">
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {creating ? '送出中…' : '送出'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
