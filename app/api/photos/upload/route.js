import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    const cluster = formData.get('cluster') || null;
    const location = formData.get('location') || null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const src = `/uploads/thumbnails/${fileName}`;

    // Veritabanına ekle (en sona)
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM photos');
    const nextOrder = maxRows[0].next_order;

    const { rows } = await pool.query(
        'INSERT INTO photos (src, cluster, location, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
        [src, cluster, location, nextOrder]
    );

    return NextResponse.json({ id: rows[0].id, src });
}
