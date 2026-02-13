import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Tekil fotoğraf + prev/next
export async function GET(request, { params }) {
    const { id } = await params;

    const { rows } = await pool.query(
        'SELECT id, src, cluster, location FROM photos ORDER BY sort_order ASC'
    );

    const index = rows.findIndex(p => p.id === Number(id));
    if (index === -1) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const photo = rows[index];
    const prev = index > 0 ? rows[index - 1].id : null;
    const next = index < rows.length - 1 ? rows[index + 1].id : null;

    return NextResponse.json({ ...photo, prev, next });
}

// PUT: Fotoğraf bilgilerini güncelle
export async function PUT(request, { params }) {
    const { id } = await params;
    const { cluster, location } = await request.json();

    await pool.query(
        'UPDATE photos SET cluster = $1, location = $2 WHERE id = $3',
        [cluster || null, location || null, Number(id)]
    );

    return NextResponse.json({ success: true });
}

// DELETE: Fotoğrafı sil
export async function DELETE(request, { params }) {
    const { id } = await params;

    await pool.query('DELETE FROM photos WHERE id = $1', [Number(id)]);

    return NextResponse.json({ success: true });
}
