import sharp from 'sharp';
import { readdir, unlink } from 'fs/promises';
import path from 'path';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:Eminenur34...@localhost:5432/cosmos',
});

const thumbDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');

async function optimize() {
    const files = await readdir(thumbDir);
    const jpgFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`Found ${jpgFiles.length} JPG/PNG files to optimize...`);

    for (const file of jpgFiles) {
        const inputPath = path.join(thumbDir, file);
        const baseName = file.replace(/\.[^/.]+$/, '');
        const webpName = `${baseName}.webp`;
        const outputPath = path.join(thumbDir, webpName);

        const oldSrc = `/uploads/thumbnails/${file}`;
        const newSrc = `/uploads/thumbnails/${webpName}`;

        // Sharp ile WebP'ye dönüştür
        await sharp(inputPath)
            .resize(800, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);

        // DB'de src güncelle
        const result = await pool.query(
            'UPDATE photos SET src = $1 WHERE src = $2',
            [newSrc, oldSrc]
        );

        console.log(`✅ ${file} → ${webpName} (${result.rowCount} rows updated)`);

        // Eski JPG'yi sil
        await unlink(inputPath);
    }

    console.log('\nDone!');
    await pool.end();
}

optimize().catch(console.error);
