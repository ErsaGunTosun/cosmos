import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { readFileSync } from 'fs';
import path from 'path';

function getConfig() {
    try {
        const fileContents = readFileSync(path.join(process.cwd(), 'data', 'config.json'), 'utf8');
        return JSON.parse(fileContents);
    } catch {
        return { theme: 'light', homepage_sort: 'custom' };
    }
}

// GET: Fotoğrafları sıralı getir (public) - Supports optional ?page=1&limit=24
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page'));
    const limit = parseInt(searchParams.get('limit'));

    const config = getConfig();
    const orderBy = config.homepage_sort === 'date' ? 'ORDER BY p.created_at DESC' : 'ORDER BY p.sort_order ASC';

    let query = `
        SELECT 
            p.id, p.src, p.blur_data, 
            l.name as location,
            p.location_id,
            COALESCE(
                (SELECT json_agg(c.name) 
                 FROM photo_clusters pc 
                 JOIN clusters c ON pc.cluster_id = c.id 
                 WHERE pc.photo_id = p.id), 
                '[]'::json
            ) as clusters
        FROM photos p
        LEFT JOIN locations l ON p.location_id = l.id
        ${orderBy}
    `;

    const values = [];
    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        const offset = (page - 1) * limit;
        query += ` LIMIT $1 OFFSET $2`;
        values.push(limit, offset);
    }

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
}

// PUT: Sırayı güncelle (auth required)
export async function PUT(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order } = await request.json();
    if (!Array.isArray(order)) {
        return NextResponse.json({ error: 'order must be an array of ids' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < order.length; i++) {
            await client.query('UPDATE photos SET sort_order = $1 WHERE id = $2', [i, order[i]]);
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        client.release();
    }

    return NextResponse.json({ success: true });
}
