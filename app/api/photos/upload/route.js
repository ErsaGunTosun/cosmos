import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import exifr from 'exifr';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const cluster = formData.get('cluster') || null;
    const location = formData.get('location') || null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // EXIF verilerini çek
    let exifData = null;
    try {
        const exif = await exifr.parse(buffer, {
            pick: ['Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime',
                'FocalLength', 'DateTimeOriginal', 'ImageWidth', 'ImageHeight',
                'ExifImageWidth', 'ExifImageHeight']
        });
        if (exif) {
            exifData = {
                camera: [exif.Make, exif.Model].filter(Boolean).join(' ') || null,
                lens: exif.LensModel || null,
                iso: exif.ISO || null,
                aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
                shutter: exif.ExposureTime
                    ? (exif.ExposureTime < 1 ? `1/${Math.round(1 / exif.ExposureTime)}` : `${exif.ExposureTime}s`)
                    : null,
                focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : null,
                date: exif.DateTimeOriginal || null,
                width: exif.ExifImageWidth || exif.ImageWidth || null,
                height: exif.ExifImageHeight || exif.ImageHeight || null,
            };
        }
    } catch {
        // EXIF yoksa sorun değil
    }

    // Blur placeholder oluştur (10px, base64)
    let blurData = null;
    try {
        const blurBuffer = await sharp(buffer)
            .resize(10, null, { withoutEnlargement: true })
            .webp({ quality: 20 })
            .toBuffer();
        blurData = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
    } catch {
        // Blur oluşturulamazsa sorun değil
    }

    // Dosya ismindeki boşlukları temizle
    const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const baseName = `${Date.now()}_${sanitizedFileName.replace(/\.[^/.]+$/, '')}`;

    // 1. Orijinali kaydet
    const originalsDir = path.join(process.cwd(), 'public', 'uploads', 'originals');
    await mkdir(originalsDir, { recursive: true });
    const originalFileName = `${baseName}${path.extname(file.name)}`;
    await writeFile(path.join(originalsDir, originalFileName), buffer);

    // 2. Sharp ile thumbnail oluştur (max 800px, WebP)
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    await mkdir(thumbnailsDir, { recursive: true });
    const thumbFileName = `${baseName}.webp`;
    await sharp(buffer)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(thumbnailsDir, thumbFileName));

    const src = `/uploads/thumbnails/${thumbFileName}`;
    const originalSrc = `/uploads/originals/${originalFileName}`;

    // 3. Veritabanına ekle
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM photos');
    const nextOrder = maxRows[0].next_order;

    const { rows } = await pool.query(
        'INSERT INTO photos (src, original_src, cluster, location, sort_order, exif_data, blur_data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [src, originalSrc, cluster, location, nextOrder, exifData ? JSON.stringify(exifData) : null, blurData]
    );

    return NextResponse.json({ id: rows[0].id, src, originalSrc });
}
