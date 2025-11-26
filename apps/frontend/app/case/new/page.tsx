'use client';

import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useMutation, useQuery} from '@apollo/client';
import {CREATE_CASE, GET_ALL_CAESE} from '@/lib/graphql/CaseGql';
import {useRouter} from 'next/navigation';

import {Input} from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {ModeToggle} from '@/components/mode-toggle';
import {Separator} from '@/components/ui/separator';
import {useEffect, useMemo} from 'react';
import {useTranslations, useLocale} from 'next-intl';


const phoneRegex = /^[0-9+\-\s]{8,20}$/;
const selectTriggerClass = 'w-full rounded-2xl ';

function genCaseNumber(now: Date, count: number) {
  const yyyy = now.getFullYear().toString();
  const mm = '0' + (now.getMonth() + 1).toString();
  const seq = String(count + 1).padStart(3, '0');
  return `${yyyy}${mm}0${seq}`;
}

/** 穩定鍵值 + 中文原文（送後端仍用中文 value） */
const prosecutorItems: {id: string; zh: string}[] = [
  {id: 'HPROS_TAIWAN', zh: '臺灣高等檢察署'},
  {id: 'HCOURT_TAIWAN', zh: '臺灣高等法院'},
  {id: 'SPC_PROS', zh: '最高檢察署'},
  {id: 'SPC_COURT', zh: '最高法院'},
  {id: 'HPROS_IP_BRANCH', zh: '臺灣高等檢察署智慧財產分署'},
  {id: 'IP_COURT', zh: '智慧財產法院'},
  {id: 'PROS_KEELUNG', zh: '臺灣基隆地方檢察署'},
  {id: 'COURT_KEELUNG', zh: '臺灣基隆地方法院'},
  {id: 'PROS_YILAN', zh: '臺灣宜蘭地方檢察署'},
  {id: 'COURT_YILAN', zh: '臺灣宜蘭地方法院'},
  {id: 'PROS_TAIPEI', zh: '臺灣臺北地方檢察署'},
  {id: 'COURT_TAIPEI', zh: '臺灣臺北地方法院'},
  {id: 'PROS_SHILIN', zh: '臺灣士林地方檢察署'},
  {id: 'COURT_SHILIN', zh: '臺灣士林地方法院'},
  {id: 'PROS_NEWTAIPEI', zh: '臺灣新北地方檢察署'},
  {id: 'COURT_NEWTAIPEI', zh: '臺灣新北地方法院'},
  {id: 'PROS_TAOYUAN', zh: '臺灣桃園地方檢察署'},
  {id: 'COURT_TAOYUAN', zh: '臺灣桃園地方法院'},
  {id: 'PROS_HSINCHU', zh: '臺灣新竹地方檢察署'},
  {id: 'COURT_HSINCHU', zh: '臺灣新竹地方法院'},
  {id: 'PROS_MIAOLI', zh: '臺灣苗栗地方檢察署'},
  {id: 'COURT_MIAOLI', zh: '臺灣苗栗地方法院'},
  {id: 'PROS_TAICHUNG', zh: '臺灣臺中地方檢察署'},
  {id: 'HPROS_TAICHUNG_BRANCH', zh: '臺灣高等檢察署臺中檢察分署'},
  {id: 'COURT_TAICHUNG', zh: '臺灣臺中地方法院'},
  {id: 'HCOURT_TAICHUNG_BRANCH', zh: '臺灣高等法院臺中分院'},
  {id: 'PROS_CHANGHUA', zh: '臺灣彰化地方檢察署'},
  {id: 'COURT_CHANGHUA', zh: '臺灣彰化地方法院'},
  {id: 'PROS_NANTOU', zh: '臺灣南投地方檢察署'},
  {id: 'COURT_NANTOU', zh: '臺灣南投地方法院'},
  {id: 'PROS_YUNLIN', zh: '臺灣雲林地方檢察署'},
  {id: 'COURT_YUNLIN', zh: '臺灣雲林地方法院'},
  {id: 'PROS_CHIAYI', zh: '臺灣嘉義地方檢察署'},
  {id: 'COURT_CHIAYI', zh: '臺灣嘉義地方法院'},
  {id: 'PROS_TAINAN', zh: '臺灣臺南地方檢察署'},
  {id: 'HPROS_TAINAN_BRANCH', zh: '臺灣高等檢察署臺南檢察分署'},
  {id: 'COURT_TAINAN', zh: '臺灣臺南地方法院'},
  {id: 'HCOURT_TAINAN_BRANCH', zh: '臺灣高等法院臺南分院'},
  {id: 'PROS_KAOHSIUNG', zh: '臺灣高雄地方檢察署'},
  {id: 'HPROS_KAOHSIUNG_BRANCH', zh: '臺灣高等檢察署高雄檢察分署'},
  {id: 'COURT_KAOHSIUNG', zh: '臺灣高雄地方法院'},
  {id: 'HCOURT_KAOHSIUNG_BRANCH', zh: '臺灣高等法院高雄分院'},
  {id: 'KAOHSIUNG_JUV_FAMILY_COURT', zh: '臺灣高雄少年及家事法院'},
  {id: 'PROS_QIAOTOU', zh: '臺灣橋頭地方檢察署'},
  {id: 'COURT_QIAOTOU', zh: '臺灣橋頭地方法院'},
  {id: 'PROS_PINGTUNG', zh: '臺灣屏東地方檢察署'},
  {id: 'COURT_PINGTUNG', zh: '臺灣屏東地方法院'},
  {id: 'PROS_PENGHU', zh: '臺灣澎湖地方檢察署'},
  {id: 'COURT_PENGHU', zh: '臺灣澎湖地方法院'},
  {id: 'PROS_HUALIEN', zh: '臺灣花蓮地方檢察署'},
  {id: 'HPROS_HUALIEN_BRANCH', zh: '臺灣高等檢察署花蓮檢察分署'},
  {id: 'COURT_HUALIEN', zh: '臺灣花蓮地方法院'},
  {id: 'HCOURT_HUALIEN_BRANCH', zh: '臺灣高等法院花蓮分院'},
  {id: 'PROS_TAITUNG', zh: '臺灣臺東地方檢察署'},
  {id: 'COURT_TAITUNG', zh: '臺灣臺東地方法院'},
  {id: 'PROS_LIENCHIANG', zh: '福建連江地方檢察署'},
  {id: 'COURT_LIENCHIANG', zh: '福建連江地方法院'},
  {id: 'PROS_KINMEN', zh: '福建金門地方檢察署'},
  {id: 'HPROS_KINMEN_BRANCH', zh: '福建高等檢察署金門檢察分署'},
  {id: 'COURT_KINMEN', zh: '福建金門地方法院'},
  {id: 'HCOURT_KINMEN_BRANCH', zh: '福建高等法院金門分院'}
];

// ---- i18n-aware Zod schema (messages from i18n) ----
function buildSchema(t: (k: string) => string) {
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
    Creator_Name: z.string().min(1, t('validation.creatorMin')),
    createdAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), t('validation.createdAtInvalid')),
    year: z.coerce
      .number()
      .int(t('validation.yearInt'))
      .min(1900, t('validation.yearMin'))
      .max(2100, t('validation.yearMax')),
    prefixLetter: z.string().optional(),
    section: z.string().optional(),
    satisfaction_levelOne: z.string().optional(),
    satisfaction_levelTwo: z.string().optional(),
    satisfaction_levelThree: z.string().optional(),
    satisfaction_levelFour: z.string().optional()
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function NewCasePage() {
  const router = useRouter();
 
  const [createCase, {loading}] = useMutation(CREATE_CASE);
  const {data, loading: allLoading} = useQuery(GET_ALL_CAESE);
  const totalCount = data?.cases?.length ?? 0;

  const locale = useLocale();  
  const t = useTranslations('CreateCase');
  const tc = useTranslations('Common');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `case-new:refreshed:${locale}`;
    const already = sessionStorage.getItem(key);
    if (!already) {
      sessionStorage.setItem(key, '1');
      router.refresh();
    }
  }, [locale, router]);
  const schema = buildSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      createdAt: new Date().toISOString(),
      caseNumber: '',
      caseType: '',
      caseName: '',
      submitUnit: '',
      submitterName: '',
      submitterPhone: '',
      submitterTel: '',
      Creator_Name: '',
      satisfaction_levelOne: '',
      satisfaction_levelTwo: '',
      satisfaction_levelThree: '',
      satisfaction_levelFour: '',
      year: new Date().getFullYear(),
      prefixLetter: '',
      section: ''
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    if (allLoading) return;
    const state = form.getFieldState('caseNumber');
    const alreadyHas = form.getValues('caseNumber');
    if (!state.isDirty && (!alreadyHas || alreadyHas.trim() === '')) {
      const auto = genCaseNumber(new Date(), totalCount);
      form.setValue('caseNumber', auto, {shouldValidate: true, shouldDirty: false});
    }
  }, [allLoading, totalCount, form]);

  /** 依目前語系產出顯示用 label，但送出 value 仍是中文 */
  const submitUnitOptions = useMemo(() => {
    return prosecutorItems
      .map(({id, zh}) => ({value: zh, label: t(`options.submitUnit.${id}`)}))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [t]);

  const onSubmit = async (v: FormValues) => {
    try {
      const {data} = await createCase({variables: {input: v}});
      const id = data?.createCase?.id;
      if (id) router.push(`/case/${id}`);
      else router.push('/case');
    } catch (err: any) {
      alert(err?.message ?? t('alerts.createFailed'));
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Top toolbar */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b bg-white/90 px-4 py-3 backdrop-blur dark:bg-gray-900/80 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{tc('theme')}</span>
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/case">{t('toolbar.back')}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section: Basic ID */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.basicId')}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.caseNumber')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.caseNumberExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.caseType')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder={t('placeholders.selectCaseType')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectGroup>
                            <SelectItem value={t('options.caseType.fraud')}>
                              {t('options.caseType.fraud')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.drugs')}>
                              {t('options.caseType.drugs')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.murder')}>
                              {t('options.caseType.murder')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.theft')}>
                              {t('options.caseType.theft')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.robbery')}>
                              {t('options.caseType.robbery')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.assault')}>
                              {t('options.caseType.assault')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.sexual')}>
                              {t('options.caseType.sexual')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.publicOrder')}>
                              {t('options.caseType.publicOrder')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.firearms')}>
                              {t('options.caseType.firearms')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.moneyLaundering')}>
                              {t('options.caseType.moneyLaundering')}
                            </SelectItem>
                            <SelectItem value={t('options.caseType.other')}>
                              {t('options.caseType.other')}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.createdAt')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.createdAtExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.caseName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.caseNameExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* Section: Numbering */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.numbering')}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="year"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.year')} *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('placeholders.yearExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder={t('placeholders.prefixLetterExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder={t('placeholders.sectionExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* Section: Submit Info */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.submitInfo')}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="submitUnit"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.submitUnit')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder={t('placeholders.selectSubmitUnit')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectGroup>
                            <ScrollArea>
                              {submitUnitOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder={t('placeholders.submitterNameExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="submitterPhone"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.submitterPhone')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.submitterPhoneExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder={t('placeholders.submitterTelExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* Section: Others */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.others')}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="Creator_Name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fields.creatorName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.creatorNameExample')} {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Submit row */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-28 bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90"
              >
                {t('buttons.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={loading}
                className="min-w-28"
              >
                {t('buttons.reset')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
