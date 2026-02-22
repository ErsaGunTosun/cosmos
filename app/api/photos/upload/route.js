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
    const clustersStr = formData.get('clusters') || formData.get('cluster') || '';
    const clusterNames = clustersStr ? clustersStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const location = formData.get('location') || null;
    const description = formData.get('description') || null;

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
    let locationId = null;
    if (location) {
        // Lokasyon var mı kontrol et, yoksa ekle
        const locRes = await pool.query('SELECT id FROM locations WHERE name = $1', [location]);
        if (locRes.rows.length > 0) {
            locationId = locRes.rows[0].id;
        } else {
            const newLoc = await pool.query('INSERT INTO locations (name) VALUES ($1) RETURNING id', [location]);
            locationId = newLoc.rows[0].id;
        }
    }

    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM photos');
    const nextOrder = maxRows[0].next_order;

    const { rows } = await pool.query(
        'INSERT INTO photos (src, original_src, location_id, sort_order, exif_data, blur_data, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [src, originalSrc, locationId, nextOrder, exifData ? JSON.stringify(exifData) : null, blurData, description]
    );
    const photoId = rows[0].id;

    // Kümeleri (clusters) kaydet
    for (const cName of clusterNames) {
        let cid = null;
        const clRes = await pool.query('SELECT id FROM clusters WHERE name = $1', [cName]);
        if (clRes.rows.length > 0) {
            cid = clRes.rows[0].id;
        } else {
            const newCl = await pool.query('INSERT INTO clusters (name) VALUES ($1) RETURNING id', [cName]);
            cid = newCl.rows[0].id;
        }
        await pool.query('INSERT INTO photo_clusters (photo_id, cluster_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [photoId, cid]);
    }

    return NextResponse.json({ id: photoId, src, originalSrc });
}
