import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Avatarları public/uploads/avatars/ altında tut (asla silme)
    const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(avatarsDir, { recursive: true });

    const fileName = `${Date.now()}_avatar.webp`;

    // Sharp ile optimize et (400x400, kare, WebP)
    await sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(path.join(avatarsDir, fileName));

    const avatarUrl = `/uploads/avatars/${fileName}`;

    // DB güncelle (eski dosyayı silme)
    await pool.query('UPDATE profile SET avatar_url = $1 WHERE id = 1', [avatarUrl]);

    return NextResponse.json({ avatarUrl });
}
