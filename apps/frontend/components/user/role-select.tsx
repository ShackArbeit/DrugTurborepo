'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props={
      value :'user' | 'admin'
      disabled?:boolean
      onChange:(next:'user'|'admin')=>void
}

export function RoleSelect({value,disabled,onChange}:Props){
      return (
             <Select
                  value={value}
                  onValueChange={(v) => onChange(v as 'user' | 'admin')}
                  disabled={disabled}
             >
                  <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
           </Select>
      )
}
