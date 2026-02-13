import pool from '@/lib/db';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const { rows: profileRows } = await pool.query(
        'SELECT name, username, bio, avatar_url FROM profile WHERE id = 1'
    );
    const profile = profileRows[0] || null;

    return <HomeClient profile={profile} />;
}
