import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Public endpoint: Autocomplete listesi için mevcut cluster'ları getirir
export async function GET() {
    try {
        const { rows } = await pool.query('SELECT id, name FROM clusters ORDER BY name ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching clusters:', error);
        return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 });
    }
}
