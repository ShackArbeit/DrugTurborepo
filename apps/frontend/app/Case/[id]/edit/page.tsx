'use client';

import {use, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useQuery, useMutation} from '@apollo/client';
import {GET_CASE_BY_ID, UPDATE_CASE} from '@/lib/graphql/CaseGql';

import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

import Link from 'next/link';
import {useTranslations} from 'next-intl';

// shadcn/ui
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {ModeToggle} from '@/components/mode-toggle';
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
  Phone
} from 'lucide-react';

// Select
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


const phoneRegex = /^[0-9+\-\s]{8,20}$/;

// 依照 t 產生 Zod Schema（把所有驗證訊息放到多語）
function buildSchema(t: (k: string, v?: any) => string) {
  return z.object({
    caseNumber: z.string().min(1, t('validation.caseNumberRequired')),
    caseType: z.string().min(1, t('validation.caseTypeRequired')),
    caseName: z.string().min(1, t('validation.caseNameRequired')),
    submitUnit: z.string().min(1, t('validation.submitUnitRequired')),
    submitterName: z.string().min(1, t('validation.submitterNameRequired')),
    submitterPhone: z
      .string()
      .min(1, t('validation.phoneRequired'))
      .regex(phoneRegex, t('validation.phoneInvalid')),
    submitterTel: z
      .string()
      .min(1, t('validation.telRequired'))
      .regex(phoneRegex, t('validation.telInvalid')),
    createdAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), t('validation.createdAtInvalid')),
    year: z.coerce
      .number()
      .int(t('validation.yearInt'))
      .min(1900, t('validation.yearMin'))
      .max(2100, t('validation.yearMax')),
    prefixLetter: z.string().optional(),
    satisfaction_levelOne: z.string().optional(),
    satisfaction_levelTwo: z.string().optional(),
    satisfaction_levelThree: z.string().optional(),
    satisfaction_levelFour: z.string().optional(),
    section: z.string().optional()
  });
}

export type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function EditCasePage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const numericId = Number(id);
  const router = useRouter();
  const t = useTranslations('CaseEdit');

  const schema = buildSchema(t);

  const {data, loading: qLoading, error} = useQuery(GET_CASE_BY_ID, {
    variables: {id: numericId}
  });
  const [updateCase, {loading: mLoading}] = useMutation(UPDATE_CASE);

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
      section: ''
    },
    mode: 'onBlur'
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
        section: c.section ?? ''
      });
    }
  }, [c, form]);

  const onSubmit = async (v: FormValues) => {
    try {
      await updateCase({
        variables: {id: numericId, input: {...v}},
        refetchQueries: [{query: GET_CASE_BY_ID, variables: {id: numericId}}],
        awaitRefetchQueries: true
      });
      router.push(`/case/${id}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Update failed');
    }
  };

  // 共用：輸入/選擇器樣式
  const inputClass =
    'h-10 rounded-2xl border border-input bg-background/60 dark:bg-slate-900/60 shadow-inner shadow-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none transition-colors';
  const selectTriggerClass = 'w-full rounded-2xl ';

  return (
    <>
      {/* 頂部工具列 */}
      <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          {/* 麵包屑 */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/case" className="transition-colors hover:text-foreground hover:underline">
              {t('breadcrumb.list')}
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <Link
              href={`/case/${id}`}
              className="transition-colors hover:text-foreground hover:underline"
            >
              {t('breadcrumb.detail')}
            </Link>
            <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
            <span className="font-medium text-foreground">{t('breadcrumb.edit')}</span>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/case">{t('actions.backToList')}</Link>
            </Button>
            {/* 直接提交表單 */}
            <Button type="submit" form="edit-case-form" disabled={mLoading} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              {mLoading ? t('actions.saving') : t('actions.save')}
            </Button>
          </div>
        </div>
      </div>

      {/* 內容 */}
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
            <AlertTitle>{t('alerts.loadFailedTitle')}</AlertTitle>
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
                {t('title')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('descriptions.formIntro')}
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form id="edit-case-form" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-10">
                  {/* 區塊一：基本識別 */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                      {t('sections.basicId')}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="caseNumber"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.caseNumber')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.caseNumberExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.caseType')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.caseTypeExample')}
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
                        render={({field}) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t('fields.caseName')} *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('placeholders.caseNameExample')}
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
                      {t('sections.numbering')}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.year')} *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('placeholders.yearExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.prefixLetter')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.prefixLetterExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.section')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.sectionExample')}
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
                      {t('sections.typeAndTime')}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="createdAt"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.createdAt')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.createdAtExample')}
                                {...field}
                                className={inputClass}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('descriptions.createdAtFormat')}
                            </FormDescription>
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
                      {t('sections.submitInfo')}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="submitUnit"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.submitUnit')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.submitUnitExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.submitterName')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.submitterNameExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 opacity-70" />
                              {t('fields.submitterPhone')} *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.submitterPhoneExample')}
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.submitterTel')} *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('placeholders.submitterTelExample')}
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
                      {t('sections.satisfaction')}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* 案件承辦速度 */}
                      <FormField
                        control={form.control}
                        name="satisfaction_levelOne"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.sat1')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder={t('placeholders.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectGroup>
                                  <SelectItem value={t('selectOptions.verySatisfied')}>{t('selectOptions.verySatisfied')}</SelectItem>
                                  <SelectItem value={t('selectOptions.satisfied')}>{t('selectOptions.satisfied')}</SelectItem>
                                  <SelectItem value={t('selectOptions.neutral')}>{t('selectOptions.neutral')}</SelectItem>
                                  <SelectItem value={t('selectOptions.slightlyDissatisfied')}>{t('selectOptions.slightlyDissatisfied')}</SelectItem>
                                  <SelectItem value={t('selectOptions.veryDissatisfied')}>{t('selectOptions.veryDissatisfied')}</SelectItem>
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.sat2')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder={t('placeholders.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value={t('selectOptions.verySatisfied')}>{t('selectOptions.verySatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.satisfied')}>{t('selectOptions.satisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.neutral')}>{t('selectOptions.neutral')}</SelectItem>
                                <SelectItem value={t('selectOptions.slightlyDissatisfied')}>{t('selectOptions.slightlyDissatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.veryDissatisfied')}>{t('selectOptions.veryDissatisfied')}</SelectItem>
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.sat3')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder={t('placeholders.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value={t('selectOptions.verySatisfied')}>{t('selectOptions.verySatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.satisfied')}>{t('selectOptions.satisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.neutral')}>{t('selectOptions.neutral')}</SelectItem>
                                <SelectItem value={t('selectOptions.slightlyDissatisfied')}>{t('selectOptions.slightlyDissatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.veryDissatisfied')}>{t('selectOptions.veryDissatisfied')}</SelectItem>
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
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>{t('fields.sat4')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder={t('placeholders.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value={t('selectOptions.verySatisfied')}>{t('selectOptions.verySatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.satisfied')}>{t('selectOptions.satisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.neutral')}>{t('selectOptions.neutral')}</SelectItem>
                                <SelectItem value={t('selectOptions.slightlyDissatisfied')}>{t('selectOptions.slightlyDissatisfied')}</SelectItem>
                                <SelectItem value={t('selectOptions.veryDissatisfied')}>{t('selectOptions.veryDissatisfied')}</SelectItem>
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
                    {mLoading ? t('actions.saving') : t('actions.save')}
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
                        section: c.section ?? ''
                      })
                    }
                    disabled={mLoading}
                    className="gap-2 rounded-xl"
                  >
                    <Undo2 className="h-4 w-4" />
                    {t('actions.resetToServer')}
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
