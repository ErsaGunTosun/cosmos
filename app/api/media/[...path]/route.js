import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    const { path: urlPath } = params;

    // Güvenlik: Path traversal saldırılarını önle
    const sanitizedPath = urlPath.join('/').replace(/(\.\.(\/|\\|$))+/g, '');

    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedPath);

    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {

        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg': contentType = 'image/jpeg'; break;
            case '.png': contentType = 'image/png'; break;
            case '.webp': contentType = 'image/webp'; break;
            case '.gif': contentType = 'image/gif'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File read error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
