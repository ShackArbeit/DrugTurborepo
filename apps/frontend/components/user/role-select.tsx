'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  value: 'user' | 'admin';
  disabled?: boolean;
  onChange: (next: 'user' | 'admin') => void;
  isSelf?: boolean;
  allowed?:Array<'user'|'admin'>
};


export function RoleSelect({ value, disabled, onChange, isSelf = false, allowed = ['user', 'admin'], }: Props) {
  const effectiveDisabled = disabled || isSelf;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (isSelf) return; 
        if (!allowed.includes(v as any)) return;
        onChange(v as 'user' | 'admin');
      }}
      disabled={effectiveDisabled}
    >
      <SelectTrigger className="h-8 w-[120px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {/* 也可以選擇 isSelf 時只顯示 admin 這一個選項；這裡採用 disabled 較直觀 */}
        <SelectItem value="user">user</SelectItem>
        <SelectItem value="admin">admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
