import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const PLACEHOLDER_CLOUDS = ['demo', 'your_cloud_name', ''];
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kloset_uploads';
const isProd = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const useLocalFallback = PLACEHOLDER_CLOUDS.includes(CLOUD_NAME);

    if (useLocalFallback) {
      if (isProd) {
        return NextResponse.json(
          { error: 'Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.' },
          { status: 502 }
        );
      }
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${randomUUID()}.${ext}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      const url = `/uploads/${filename}`;
      return NextResponse.json({
        public_id: filename.replace(`.${ext}`, ''),
        secure_url: url,
        url,
        width: 800,
        height: 1000,
        format: ext,
        bytes: file.size,
      });
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', new Blob([buffer], { type: file.type }), file.name);
    cloudinaryForm.append('upload_preset', UPLOAD_PRESET);
    cloudinaryForm.append('folder', 'kloset/outfits');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const cloudRes = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryForm,
    });

    if (!cloudRes.ok) {
      const errText = await cloudRes.text();
      return NextResponse.json({ error: 'Cloudinary upload failed', detail: errText }, { status: 502 });
    }

    const result = await cloudRes.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

