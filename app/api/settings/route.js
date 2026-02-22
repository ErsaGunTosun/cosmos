import { NextResponse } from 'next/server';
import { readFileSync, promises as fsPromises } from 'fs';
import path from 'path';
import { verifyAuth } from '@/lib/auth';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

// Yardımcı Fonksiyon: Dosyadan güncel config oku
function getConfig() {
    try {
        const fileContents = readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(fileContents);
    } catch {
        // Eğer dosya yoksa veya bozuksa default dön
        return {
            theme: 'light',
            custom_colors: { background: '#252422', foreground: '#fffcf2' },
            homepage_sort: 'custom'
        };
    }
}

// GET: Mevcut ayarları getir (Herkesin okuması için public)
export async function GET() {
    const config = getConfig();
    return NextResponse.json(config);
}

// PUT: Ayarları güncelle (Sadece yetkili Admin)
export async function PUT(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const existingConfig = getConfig();
        const incomingData = await request.json();

        // Yeni objeyi eski objenin üzerine yaz
        const newConfig = {
            ...existingConfig,
            ...incomingData
        };

        // data klasörü yoksa ihtimale karşı yarat komutu (docker compose volume mount'da otomatik oluşur genelde ama iyi bir tedbirdir)
        await fsPromises.mkdir(path.dirname(CONFIG_PATH), { recursive: true });

        // json dosyasının içine güncel objeyi formatlı olarak yaz
        await fsPromises.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 4), 'utf8');

        return NextResponse.json({ success: true, config: newConfig });
    } catch (err) {
        return NextResponse.json({ error: 'Ayarlar kaydedilemedi: ' + err.message }, { status: 500 });
    }
}
