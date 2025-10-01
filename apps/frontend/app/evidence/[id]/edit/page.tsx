'use client';

import { use, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { GET_EVIDENCE_BY_ID, UPDATE_EVIDENCE } from '@/lib/graphql/EvidenceGql';
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
import { useTranslations } from 'next-intl';

import LiveCameraCapture from '@/lib/LiveCameraCapture';
import { uploadImage } from '@/lib/uploadImage';


/** 顯示字串 Normalize */
function normalizeDisplay(value?: string | boolean | Date | null): string {
  if (value === null || value === undefined) return '-';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString();
    }
    const trimmed = value.trim();
    return trimmed === '' ? '-' : trimmed;
  }
  try {
    return String(value);
  } catch {
    return '-';
  }
}

/** 案件摘要卡片（頂部） */
function CaseSummaryCard({
  caseNumber,
  caseName,
}: {
  caseNumber?: string | null;
  caseName?: string | null;
}) {
  const t = useTranslations('EvidenceEdit');

  return (
    <div className="w-full rounded-3xl border overflow-hidden shadow-sm dark:border-zinc-800">
      <div className="relative">
        <div className="h-20 md:h-24 bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 dark:from-sky-900/40 dark:via-teal-900/30 dark:to-emerald-900/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-4 md:pb-5 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('sections.caseInfo')}
            </h2>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('fields.linkedCaseNumber')}
            </dt>
            <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {normalizeDisplay(caseNumber ?? '')}
            </dd>
          </div>

          <div className="sm:col-span-9">
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('fields.caseName')}
            </dt>
            <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {normalizeDisplay(caseName ?? '')}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-200/70 dark:border-zinc-800" />
      </div>
    </div>
  );
}

type FormValues = {
  caseNumber: string;
  caseName: string;
  evidenceNumber: string;
  evidenceType: string;
  evidenceBrand: string;
  evidenceOriginalNo?: string;
  evidenceSerialNo?: string;
  deliveryName: string;
  receiverName: string;
  deliveryName2?: string;
  receiverName2?: string;
  createdAt: string;
  is_Pickup: boolean;
  is_rejected: boolean;
  is_beyond_scope: boolean;
  is_lab_related: boolean;
  is_info_complete: boolean;
  photoFront?: any;
  photoBack?: any;
  photoFront2?: any;
  photoBack2?: any;
};

export default function EditEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('EvidenceEdit');
  const { id } = use(params);
  const numericId = Number(id);
  const router = useRouter();

  /** 用 t 產生 zod schema（讓錯誤訊息可雙語） */
  const schema = useMemo(() => {
    return z.object({
      caseNumber: z.string().min(1, t('validation.caseNumberRequired')),
      caseName: z.string().min(1, t('validation.caseNameRequired')),
      evidenceNumber: z.string().min(1, t('validation.evidenceNumberRequired')),
      evidenceType: z.string().min(1, t('validation.evidenceTypeRequired')),
      evidenceBrand: z.string().min(1, t('validation.evidenceBrandRequired')),
      evidenceOriginalNo: z.string().optional(),
      evidenceSerialNo: z.string().optional(),
      deliveryName: z.string().min(1, t('validation.deliveryNameRequired')),
      receiverName: z.string().min(1, t('validation.receiverNameRequired')),
      deliveryName2: z.string().optional(),
      receiverName2: z.string().optional(),
      createdAt: z
        .string()
        .refine((v) => !Number.isNaN(Date.parse(v)), t('validation.createdAtInvalid')),
      is_Pickup: z.boolean().default(false),
      is_rejected: z.boolean().default(false),
      is_beyond_scope: z.boolean().default(false),
      is_lab_related: z.boolean().default(false),
      is_info_complete: z.boolean().default(false),
      photoFront: z.any().optional(),
      photoBack: z.any().optional(),
      photoFront2: z.any().optional(),
      photoBack2: z.any().optional(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t('validation.createdAtInvalid')]); // 依賴其中一個 key 避免 ESLint 抱怨

  // 1) 單一證物
  const { data, loading: qLoading, error } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: numericId },
    fetchPolicy: 'cache-and-network',
  });

  // 3) 更新 mutation
  const [updateEvidence, { loading: mLoading }] = useMutation(UPDATE_EVIDENCE);

  // 4) 表單
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: '',
      caseName: '',
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
      caseName: e.case?.caseName ?? '',
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
      photoFront: undefined,
      photoBack: undefined,
      photoFront2: undefined,
      photoBack2: undefined,
    });
  }, [e]);

 
  const ensureUrl = async (v: any, fallback?: string) => {
    if (!v) return fallback ?? '';
    if (typeof v === 'string') return v.trim();
    if (v instanceof File) return uploadImage(v);
    return fallback ?? '';
  };

  const onSubmit = async (v: FormValues) => {
    try {
      const payload = {
        caseNumber: v.caseNumber,
        caseName: v.caseName,
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
      alert(err?.message ?? t('alerts.updateFailed'));
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
          <AlertTitle>{t('alerts.loadFailedTitle')}</AlertTitle>
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
            <Link href="/evidence" className="hover:underline">{t('breadcrumb.list')}</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link href={`/evidence/${id}`} className="hover:underline">{t('breadcrumb.detail')}</Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">{t('breadcrumb.edit')}</span>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
    
            <Button asChild variant="outline">
              <Link href={`/evidence/${id}`}>{t('actions.backToDetail')}</Link>
            </Button>
            <Button type="submit" form="edit-evidence-form" disabled={mLoading} className="gap-2">
              {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mLoading ? t('actions.saving') : t('actions.save')}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">{t('title')}</CardTitle>
            <CardDescription>{t('descriptions.photoOverwrite')}</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form id="edit-evidence-form" onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-10">
                {/* 對應案件 */}
                <CaseSummaryCard caseNumber={e.case?.caseNumber} caseName={e.case?.caseName} />

                <Separator />

                {/* 基本資訊 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('sections.basic')}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {([
                      ['evidenceNumber', t('fields.evidenceNumber'), t('placeholders.evidenceNumber')],
                      ['evidenceType', t('fields.evidenceType'), t('placeholders.evidenceType')],
                      ['evidenceBrand', t('fields.evidenceBrand'), t('placeholders.evidenceBrand')],
                      ['evidenceSerialNo', t('fields.evidenceSerialNoOpt'), t('placeholders.evidenceSerialNo')],
                    ] as const).map(([name, label, ph]) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl><Input placeholder={ph} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    ))}
                    <FormField control={form.control} name="evidenceOriginalNo" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t('fields.evidenceOriginalNoOpt')}</FormLabel>
                        <FormControl><Input placeholder={t('placeholders.evidenceOriginalNo')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </section>

                <Separator />

                {/* 鑑識結果 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('sections.forensics')}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {([
                      ['is_Pickup',t('fields.is_pickup')],
                      ['is_rejected', t('fields.is_rejected')],
                      ['is_beyond_scope', t('fields.is_beyond_scope')],
                      ['is_lab_related', t('fields.is_lab_related')],
                      ['is_info_complete', t('fields.is_info_complete')],
                    ] as const).map(([name, label]) => (
                      <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="mb-4">{label}</FormLabel>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    ))}
                  </div>
                </section>

                {/* 交付與接收 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('sections.delivery')}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {([
                      ['deliveryName', t('fields.deliveryNameReq'), t('placeholders.deliveryName')],
                      ['receiverName', t('fields.receiverNameReq'), t('placeholders.receiverName')],
                      ['deliveryName2', t('fields.deliveryName2'), t('placeholders.deliveryName2')],
                      ['receiverName2', t('fields.receiverName2'), t('placeholders.receiverName2')],
                    ] as const).map(([name, label, ph]) => (
                      <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="mb-4">{label}</FormLabel>
                          <FormControl><Input placeholder={ph} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* 照片（相機擷取） */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('sections.photosCapture')}</h3>

                  {e && (e.photoFront || e.photoBack || e.photoFront2 || e.photoBack2) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border p-4">
                      {e.photoFront && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">{t('photos.currentFront')}</div>
                          <img src={e.photoFront} alt={t('photos.frontAlt')} className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoBack && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">{t('photos.currentBack')}</div>
                          <img src={e.photoBack} alt={t('photos.backAlt')} className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoFront2 && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">{t('photos.currentFront2')}</div>
                          <img src={e.photoFront2} alt={t('photos.front2Alt')} className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                      {e.photoBack2 && (
                        <div>
                          <div className="text-sm mb-1 text-muted-foreground">{t('photos.currentBack2')}</div>
                          <img src={e.photoBack2} alt={t('photos.back2Alt')} className="w-full rounded-lg object-contain bg-black/5" />
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">{t('photos.hintRetake')}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller control={form.control} name="photoFront" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('photos.front')}</FormLabel>
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
                        <FormLabel>{t('photos.back')}</FormLabel>
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
                        <FormLabel>{t('photos.front2Opt')}</FormLabel>
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
                        <FormLabel>{t('photos.back2Opt')}</FormLabel>
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

                {/* 時間與狀態 */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('sections.timeStatus')}</h3>
                  <FormField control={form.control} name="createdAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.createdAtReq')}</FormLabel>
                      <FormControl><Input placeholder={t('placeholders.createdAt')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </section>
              </CardContent>

              <CardFooter className="flex gap-2 border-t p-4">
                <Button type="submit" disabled={mLoading} className="gap-2">
                  {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {mLoading ? t('actions.saving') : t('actions.save')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
