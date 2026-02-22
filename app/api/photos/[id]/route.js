import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Tekil fotoğraf + prev/next
export async function GET(request, { params }) {
    const { id } = await params;

    const { rows } = await pool.query(`
        SELECT 
            p.id, p.src, p.original_src, p.exif_data,
            c.name as cluster, 
            l.name as location,
            p.cluster_id, p.location_id
        FROM photos p
        LEFT JOIN clusters c ON p.cluster_id = c.id
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
    const { cluster, location } = await request.json();

    let clusterId = null;
    if (cluster) {
        const clRes = await pool.query('SELECT id FROM clusters WHERE name = $1', [cluster]);
        if (clRes.rows.length > 0) {
            clusterId = clRes.rows[0].id;
        } else {
            const newCl = await pool.query('INSERT INTO clusters (name) VALUES ($1) RETURNING id', [cluster]);
            clusterId = newCl.rows[0].id;
        }
    }

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
        'UPDATE photos SET cluster_id = $1, location_id = $2 WHERE id = $3',
        [clusterId, locationId, Number(id)]
    );

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
