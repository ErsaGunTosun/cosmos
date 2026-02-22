import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Public endpoint: Autocomplete listesi için mevcut lokasyonları getirir
export async function GET() {
    try {
        // District opsiyonel olarak kullanılabilir, şimdilik sadece name dönüyoruz
        const { rows } = await pool.query('SELECT id, name FROM locations ORDER BY name ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}
