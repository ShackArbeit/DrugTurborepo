'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation,useQuery } from '@apollo/client';
import { CREATE_CASE,GET_ALL_CAESE } from '@/lib/graphql/CaseGql';
import { useRouter } from 'next/navigation';
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
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import {useEffect} from 'react'

const phoneRegex = /^[0-9+\-\s]{8,20}$/;

 const selectTriggerClass = 'w-full rounded-2xl ';


function genCaseNumber(now:Date,count:number){
    const yyyy = now.getFullYear().toString()
    const mm = '0'+now.getMonth().toString()
    const seq = String(count+1).padStart(3,'0')
    return `${yyyy}${mm}0${seq}`
}

const ProsecutorList01 = [
  '臺灣高等檢察署',
  '臺灣高等法院',
  '最高檢察署',
  '最高法院',
  '臺灣高等檢察署智慧財產分署',
  '智慧財產法院',
  '臺灣基隆地方檢察署',
  '臺灣基隆地方法院',
  '臺灣宜蘭地方檢察署',
  '臺灣宜蘭地方法院',
  '臺灣臺北地方檢察署',
  '臺灣臺北地方法院',
  '臺灣士林地方檢察署',
  '臺灣士林地方法院',
  '臺灣新北地方檢察署',
  '臺灣新北地方法院',
  '臺灣桃園地方檢察署',
  '臺灣桃園地方法院',
  '臺灣新竹地方檢察署',
  '臺灣新竹地方法院',
  '臺灣苗栗地方檢察署',
  '臺灣苗栗地方法院',
  '臺灣臺中地方檢察署',
  '臺灣高等檢察署臺中檢察分署',
  '臺灣臺中地方法院',
  '臺灣高等法院臺中分院',
  '臺灣彰化地方檢察署',
  '臺灣彰化地方法院',
  '臺灣南投地方檢察署',
  '臺灣南投地方法院',
  '臺灣雲林地方檢察署',
  '臺灣雲林地方法院',
  '臺灣嘉義地方檢察署',
  '臺灣嘉義地方法院',
  '臺灣臺南地方檢察署',
  '臺灣高等檢察署臺南檢察分署',
  '臺灣臺南地方法院',
  '臺灣高等法院臺南分院',
  '臺灣高雄地方檢察署',
  '臺灣高等檢察署高雄檢察分署',
  '臺灣高雄地方法院',
  '臺灣高等法院高雄分院',
  '臺灣高雄少年及家事法院',
  '臺灣橋頭地方檢察署',
  '臺灣橋頭地方法院',
  '臺灣屏東地方檢察署',
  '臺灣屏東地方法院',
  '臺灣澎湖地方檢察署',
  '臺灣澎湖地方法院',
  '臺灣花蓮地方檢察署',
  '臺灣高等檢察署花蓮檢察分署',
  '臺灣花蓮地方法院',
  '臺灣高等法院花蓮分院',
  '臺灣臺東地方檢察署',
  '臺灣臺東地方法院',
  '福建連江地方檢察署',
  '福建連江地方法院',
  '福建金門地方檢察署',
  '福建高等檢察署金門檢察分署',
  '福建金門地方法院',
  '福建高等法院金門分院',
];
const prosecutorOptions = Array.from(new Set(ProsecutorList01))
    .sort((a, b) => a.localeCompare(b, 'zh-Hant-TW'));



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
  Creator_Name: z.string().min(1, '至少輸入三個文字以上'),
  createdAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), '建立時間格式需為 ISO 或可被解析的日期字串'),
  year: z.coerce
    .number()
    .int('年度需為整數')
    .min(1900, '年度不可小於 1900')
    .max(2100, '年度不可大於 2100'),
  prefixLetter: z.string().optional(),
  section: z.string().optional(),
  satisfaction_levelOne: z.string().optional(),
  satisfaction_levelTwo: z.string().optional(),
  satisfaction_levelThree: z.string().optional(),
  satisfaction_levelFour: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function NewCasePage() {
  const router = useRouter();
  const [createCase, { loading }] = useMutation(CREATE_CASE);
  const {data, loading:allLoading}= useQuery(GET_ALL_CAESE)
  const totalCount = data?.cases?.length ?? 0;

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
      section: '',
    },
    mode: 'onBlur',
  });

  useEffect(()=>{
        if(allLoading)return 
        const state = form.getFieldState('caseNumber')
        const alreadyHas = form.getValues('caseNumber');
         if( !state.isDirty && (!alreadyHas || alreadyHas.trim()==='')){
             const auto = genCaseNumber(new Date,totalCount)
             form.setValue('caseNumber',auto,{shouldValidate: true, shouldDirty: false })
         }
           
  },[allLoading,totalCount,form])

  const onSubmit = async (v: FormValues) => {
    try {
      const { data } = await createCase({ variables: { input: v } });
      const id = data?.createCase?.id;
      if (id) router.push(`/case/${id}`);
      else router.push('/case');
    } catch (err: any) {
      alert(err?.message ?? '建立失敗，請稍後再試');
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* 頂部工具列 */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b bg-white/90 px-4 py-3 backdrop-blur dark:bg-gray-900/80 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">新增案件</h1>
            <p className="text-sm text-muted-foreground">請填寫下列案件資訊並提交。</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">切換主題</span>
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/case">返回列表</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 表單卡片 */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 區塊：基本識別 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">基本識別</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>案件編號 *</FormLabel>
                      <FormControl>
                         <Input placeholder="例：113-北-000123" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>案件類型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇案件類型…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectGroup>
                                  <SelectItem value="詐欺">詐欺</SelectItem>
                                  <SelectItem value="毒品">毒品</SelectItem>
                                  <SelectItem value="殺人">殺人</SelectItem>
                                  <SelectItem value="竊盜">竊盜</SelectItem>
                                  <SelectItem value="強盜">強盜</SelectItem>
                                  <SelectItem value="傷害">傷害</SelectItem>
                                  <SelectItem value="侵害性自主">侵害性自主</SelectItem>
                                  <SelectItem value="妨害公共秩序">妨害公共秩序</SelectItem>
                                  <SelectItem value="槍砲彈藥刀械管制">槍砲彈藥刀械管制</SelectItem>
                                  <SelectItem value="洗錢">洗錢</SelectItem>
                                  <SelectItem value="其他">其他</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                      {/* <FormControl>
                        <Input placeholder="例：毒品、詐欺、車禍…" {...field} />
                      </FormControl> */}
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>建立時間（ISO）*</FormLabel>
                      <FormControl>
                        <Input placeholder="例如 2025-08-14T10:00:00.000Z" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>案件摘要 *</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入案件摘要/描述…" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* 區塊：編號屬性 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">編號屬性</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>年度 *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="例：2025" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder="例：北、桃、刑…" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder="例：偵二、鑑識股…" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* 區塊：送件資訊 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">送件資訊</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="submitUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>送件單位 *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue placeholder="請選擇送件單位…" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectGroup>
                                 <ScrollArea>
                                    {prosecutorOptions.map((name)=>(
                                       <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                 </ScrollArea>                   
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                      {/* <FormControl>
                        <Input placeholder="例：某某分局偵查隊" {...field} />
                      </FormControl> */}
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder="例：王小明" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder="例：0912-345-678" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
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
                        <Input placeholder="例：02-1234-5678" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* 區塊：其他 */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">其他</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="Creator_Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>建立資料者姓名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="姓名..." {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

            
            </section>

            {/* 提交列 */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button type="submit" disabled={loading} className="min-w-28 bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90">
                送出
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={loading}
                className="min-w-28"
              >
                清除
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
