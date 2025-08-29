import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image/* allowed' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Max 5MB' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name || '') || '.jpg';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
    await fs.writeFile(path.join(uploadsDir, name), bytes);

    const baseUrl = new URL(req.url).origin;
    const url = `${baseUrl}/uploads/${name}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
