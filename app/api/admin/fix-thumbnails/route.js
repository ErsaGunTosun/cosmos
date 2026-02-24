import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // GET all photos from DB that have an original source
        const { rows } = await pool.query('SELECT id, original_src, src FROM photos WHERE original_src IS NOT NULL');

        let fixedCount = 0;
        let errors = [];

        for (const photo of rows) {
            try {
                // The DB stores paths like /uploads/originals/filename.ext
                const originalFilePath = path.join(process.cwd(), 'public', photo.original_src);
                const buffer = await readFile(originalFilePath);

                // Re-generate webp thumbnail with .rotate() 
                const timestamp = Date.now();
                const newFileName = `${path.basename(photo.src, '.webp')}_${timestamp}.webp`;
                const thumbFilePath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', newFileName);

                await sharp(buffer)
                    .rotate() // <--- The magic fix
                    .resize(800, null, { withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(thumbFilePath);

                // Re-generate base64 blur payload with .rotate()
                const blurBuffer = await sharp(buffer)
                    .rotate()
                    .resize(10, null, { withoutEnlargement: true })
                    .webp({ quality: 20 })
                    .toBuffer();

                const blurData = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
                const newSrc = `/uploads/thumbnails/${newFileName}`;

                // Update DB with the fixed blur_data and new URL to bust cache
                await pool.query('UPDATE photos SET blur_data = $1, src = $2 WHERE id = $3', [blurData, newSrc, photo.id]);

                fixedCount++;
            } catch (err) {
                console.error(`Failed to process photo ID ${photo.id}:`, err);
                errors.push(`ID ${photo.id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            fixed: fixedCount,
            totalAttempted: rows.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (dbErr) {
        console.error('Fatal fix-thumbnails error:', dbErr);
        return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
}
