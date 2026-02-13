import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Profil bilgilerini getir (public)
export async function GET() {
    const { rows } = await pool.query('SELECT name, username, bio, avatar_url FROM profile WHERE id = 1');
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}

// PUT: Profil bilgilerini güncelle (auth required)
export async function PUT(request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, username, bio } = await request.json();

    await pool.query(
        'UPDATE profile SET name = COALESCE($1, name), username = COALESCE($2, username), bio = COALESCE($3, bio) WHERE id = 1',
        [name, username, bio]
    );

    return NextResponse.json({ success: true });
}
