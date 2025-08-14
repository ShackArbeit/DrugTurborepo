'use client'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import { useQuery,useMutation } from '@apollo/client'
import { GET_CASE_BY_ID } from '@/lib/graphql/CaseGql'
import { UPDATE_CASE } from '@/lib/graphql/CaseGql'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
      Form,
      FormField,
      FormItem,
      FormLabel,
      FormControl,
      FormMessage,
} from '@/components/ui/form';
import {use} from 'react'

const phoneRegex = /^[0-9+\-\s]{8,20}$/;
const schema=z.object({
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
})

type FormValues = z.infer<typeof schema>

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }){
      const { id } = use(params);
      const numericId = Number(id);
      const router = useRouter()
      const {data, loading:qLoading, error} = useQuery(GET_CASE_BY_ID,{
            variables:{ id: numericId }
      })
      const [updateCase,{loading:mLoading}] = useMutation(UPDATE_CASE);

      const form = useForm<FormValues>({
            resolver:zodResolver(schema),
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
      })
      const c = data?.case;
      if(c && !qLoading && !form.formState.isDirty){
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
      const onSubmit=async (v: FormValues) =>{
            try{
                 await updateCase({variables:{
                        id:numericId,
                        input:{...v}
                 }})
                  router.push(`/case/${id}`)
           }catch(err:any){
                   alert(err?.message ?? '更新失敗，請稍後再試');
            }
            
      }
      if (qLoading) return <div className="p-4">載入中…</div>;
      if (error) return <div className="p-4">錯誤：{String(error.message)}</div>;
      return (
         <div className="p-4 max-w-4xl m-auto border border-1 border-teal-700">
            <h1 className="text-3xl font-semibold mb-4">編輯案件</h1>
              <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name='caseNumber'
                        render={({field})=>(
                              <FormItem>
                                    <FormLabel>案件編號 *</FormLabel>
                                    <FormControl>
                                          <Input placeholder="例：113-北-000123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                              </FormItem>
                        )} 
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="caseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>案件類型 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例：毒品、詐欺、車禍…" {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="caseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>案件摘要 *</FormLabel>
                <FormControl>
                  <Textarea placeholder="輸入案件摘要/描述…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="submitUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>送件單位 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例：某某分局偵查隊" {...field} />
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
                    <Input placeholder="例：王小明" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="submitterPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手機 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例：0912-345-678" {...field} />
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
                    <Input placeholder="例：02-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="submitterSignature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>簽名（圖檔路徑/Base64）*</FormLabel>
                <FormControl>
                  <Input placeholder="例：/uploads/sign/xxx.png 或 data:image/png;base64,..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>年度 *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="例：2025" {...field} />
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
                    <Input placeholder="例：北、桃、刑…" {...field} />
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
                    <Input placeholder="例：偵二、鑑識股…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={mLoading}>
              儲存
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(form.getValues())}
              disabled={mLoading}
            >
              還原目前輸入
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => c && form.reset({
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
              })}
              disabled={mLoading}
            >
              還原成後端值
            </Button>
          </div>
               </form>
              </Form>
         </div>
      )
}
