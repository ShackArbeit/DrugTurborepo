'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_CASE } from '@/lib/graphql/CaseGql';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';

const phoneRegex = /^[0-9+\-\s]{8,20}$/;


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
});

type FormValues = z.infer<typeof schema>;

export default function NewCasePage() {
  const router = useRouter();
  const [createCase, { loading }] = useMutation(CREATE_CASE);

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
      year: new Date().getFullYear(),
      prefixLetter: '',
      section: '',
    },
    mode: 'onBlur',
  });

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
    <div className="p-4 max-w-5xl border-4 border-indigo-200 border-y-indigo-500 m-auto ">
      <div className='w-full flex mt-3 mb-3 justify-around'>   
        <p className='mx-4'>點擊轉換模式<ModeToggle/></p>
        <Button asChild >
                <Link href="/case">返回列表</Link>
        </Button>
    </div>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-5 ">
          <FormField
            control={form.control}
            name="caseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-2'>案件編號 *</FormLabel>
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
                  <FormLabel className='mb-2'>案件類型 *</FormLabel>
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
                  <FormLabel className='mb-2'>建立時間（ISO）*</FormLabel>
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
                <FormLabel className='mb-2'>案件摘要 *</FormLabel>
                <FormControl>
                  <Textarea placeholder="輸入案件摘要/描述…" {...field} />
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
                  <FormLabel className='mb-2'>年度 *</FormLabel>
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
                  <FormLabel className='mb-2'>冠字（可選）</FormLabel>
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
                  <FormLabel className='mb-2'>股別（可選）</FormLabel>
                  <FormControl>
                    <Input placeholder="例：偵二、鑑識股…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="submitUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-2'>送件單位 *</FormLabel>
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
                  <FormLabel className='mb-2'>送件人姓名 *</FormLabel>
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
                  <FormLabel className='mb-2'>手機 *</FormLabel>
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
                  <FormLabel className='mb-2'>市話 *</FormLabel>
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
            name="Creator_Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-2'>建立資料者姓名</FormLabel>
                <FormControl>
                  <Input placeholder="姓名..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center gap-2 pt-2  ">
            <Button type="submit" disabled={loading}>
              送出
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={loading}
            >
              清除
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
