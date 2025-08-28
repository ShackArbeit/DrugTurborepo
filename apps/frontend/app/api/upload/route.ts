import { NextResponse} from "next/server";
import { randomBytes } from "node:crypto";
import { promises as fs } from 'fs'
import path from "node:path";

export const runtime ='nodejs'
export const dynamic ='force-dynamic'

export async function POST(req:Request){
      try{
            const form = await req.formData();
            const file = form.get('file') as File| null;
            if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
            if(!file.type?.startsWith('image/')){
                  return NextResponse.json({ error: 'Only image/* allowed' }, { status: 400 });
            }
            if(file.size>5*1024*1024){
                   return NextResponse.json({ error: 'Max 5MB' }, { status: 400 });
            }
            const bytes = Buffer.from(await file.arrayBuffer())
            const uploadsDir = path.join(process.cwd(), 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            const ext = path.extname(file.name ||'') || '.jpg'
            const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`
            const filePath = path.join(uploadsDir,name);
            await fs.writeFile(filePath,bytes)
      }catch(e:any){
            console.error(e);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
}
