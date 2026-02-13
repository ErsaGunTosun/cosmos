import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fotoğrafları sıralı getir
export async function GET() {
    const { rows } = await pool.query(
        'SELECT id, src, cluster, location FROM photos ORDER BY sort_order ASC'
    );
    return NextResponse.json(rows);
}

// PUT: Sırayı güncelle
export async function PUT(request) {
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
