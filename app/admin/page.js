import pool from '@/lib/db';
import AdminClient from '@/components/admin/AdminClient';

export const dynamic = 'force-dynamic';

export default async function Admin() {
    const { rows } = await pool.query(
        'SELECT name, username, bio, avatar_url FROM profile WHERE id = 1'
    );
    const profile = rows[0] || null;

    return <AdminClient profile={profile} />;
}
