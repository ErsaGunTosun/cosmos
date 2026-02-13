import sharp from 'sharp';
import { readFile } from 'fs/promises';
import path from 'path';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:Eminenur34...@localhost:5432/cosmos',
});

async function backfill() {
    const { rows } = await pool.query('SELECT id, original_src FROM photos WHERE blur_data IS NULL AND original_src IS NOT NULL');
    console.log(`Found ${rows.length} photos to generate blur placeholders...`);

    for (const row of rows) {
        const filePath = path.join(process.cwd(), 'public', row.original_src);
        try {
            const buffer = await readFile(filePath);
            const blurBuffer = await sharp(buffer)
                .resize(10, null, { withoutEnlargement: true })
                .webp({ quality: 20 })
                .toBuffer();
            const blurData = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

            await pool.query('UPDATE photos SET blur_data = $1 WHERE id = $2', [blurData, row.id]);
            console.log(`✅ ID ${row.id}: blur generated (${blurData.length} chars)`);
        } catch (err) {
            console.log(`❌ ID ${row.id}: ${err.message}`);
        }
    }

    console.log('\nDone!');
    await pool.end();
}

backfill().catch(console.error);
