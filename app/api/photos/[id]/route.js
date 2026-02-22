import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Tekil fotoğraf + prev/next
export async function GET(request, { params }) {
    const { id } = await params;

    const { rows } = await pool.query(`
        SELECT 
            p.id, p.src, p.original_src, p.exif_data, p.description,
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
        ORDER BY p.sort_order ASC
    `);

    const index = rows.findIndex(p => p.id === Number(id));
    if (index === -1) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const photo = rows[index];
    const prev = index > 0 ? rows[index - 1].id : null;
    const next = index < rows.length - 1 ? rows[index + 1].id : null;

    return NextResponse.json({ ...photo, prev, next });
}

// PUT: Fotoğraf bilgilerini güncelle (auth required)
export async function PUT(request, { params }) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { clusters, location, description } = await request.json();

    let locationId = null;
    if (location) {
        const locRes = await pool.query('SELECT id FROM locations WHERE name = $1', [location]);
        if (locRes.rows.length > 0) {
            locationId = locRes.rows[0].id;
        } else {
            const newLoc = await pool.query('INSERT INTO locations (name) VALUES ($1) RETURNING id', [location]);
            locationId = newLoc.rows[0].id;
        }
    }

    await pool.query(
        'UPDATE photos SET location_id = $1, description = $2 WHERE id = $3',
        [locationId, description, Number(id)]
    );

    // Photo clusters update
    await pool.query('DELETE FROM photo_clusters WHERE photo_id = $1', [Number(id)]);
    if (clusters && Array.isArray(clusters)) {
        for (const cName of clusters) {
            let cid = null;
            const clRes = await pool.query('SELECT id FROM clusters WHERE name = $1', [cName]);
            if (clRes.rows.length > 0) {
                cid = clRes.rows[0].id;
            } else {
                const newCl = await pool.query('INSERT INTO clusters (name) VALUES ($1) RETURNING id', [cName]);
                cid = newCl.rows[0].id;
            }
            await pool.query('INSERT INTO photo_clusters (photo_id, cluster_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [Number(id), cid]);
        }
    }

    return NextResponse.json({ success: true });
}

// DELETE: Fotoğrafı sil (auth required)
export async function DELETE(request, { params }) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await pool.query('DELETE FROM photos WHERE id = $1', [Number(id)]);

    return NextResponse.json({ success: true });
}
