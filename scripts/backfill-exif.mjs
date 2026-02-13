import exifr from 'exifr';
import { readFile } from 'fs/promises';
import path from 'path';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:Eminenur34...@localhost:5432/cosmos',
});

async function backfill() {
    const { rows } = await pool.query('SELECT id, original_src FROM photos WHERE exif_data IS NULL AND original_src IS NOT NULL');
    console.log(`Found ${rows.length} photos to backfill...`);

    for (const row of rows) {
        const filePath = path.join(process.cwd(), 'public', row.original_src);

        try {
            const buffer = await readFile(filePath);
            const exif = await exifr.parse(buffer, {
                pick: ['Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime',
                    'FocalLength', 'DateTimeOriginal', 'ImageWidth', 'ImageHeight',
                    'ExifImageWidth', 'ExifImageHeight']
            });

            if (exif) {
                const exifData = {
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

                await pool.query('UPDATE photos SET exif_data = $1 WHERE id = $2', [JSON.stringify(exifData), row.id]);
                console.log(`✅ ID ${row.id}: ${exifData.camera || 'No camera'} | ${exifData.aperture || '-'} | ISO ${exifData.iso || '-'}`);
            } else {
                console.log(`⚠️  ID ${row.id}: No EXIF data found`);
            }
        } catch (err) {
            console.log(`❌ ID ${row.id}: ${err.message}`);
        }
    }

    console.log('\nDone!');
    await pool.end();
}

backfill().catch(console.error);
