import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

const SECRET = process.env.JWT_SECRET;

// POST: Login
export async function POST(request) {
    const { username, password } = await request.json();

    const { rows } = await pool.query(
        'SELECT id, username, password_hash, display_name FROM admins WHERE username = $1',
        [username]
    );

    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
        { id: admin.id, username: admin.username, name: admin.display_name },
        SECRET,
        { expiresIn: '7d' }
    );

    const response = NextResponse.json({ success: true, name: admin.display_name });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    return response;
}

// GET: Token kontrolü
export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        return NextResponse.json({ authenticated: true, name: decoded.name });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
