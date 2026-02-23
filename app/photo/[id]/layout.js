import pool from '@/lib/db';

export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        const { rows } = await pool.query(
            'SELECT src, original_src, location FROM photo WHERE id = $1',
            [id]
        );
        const photo = rows[0];

        if (!photo) {
            return {
                title: 'Photo Not Found | Noir',
            };
        }

        const imageUrl = photo.original_src || photo.src;
        const siteName = 'Noir Gallery';
        const title = photo.location ? `${photo.location} | ${siteName}` : `Photo | ${siteName}`;
        const description = `View this photograph on ${siteName}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: photo.location || 'Photograph',
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch (e) {
        console.error('Error generating metadata:', e);
        return {
            title: 'Noir',
        };
    }
}

export default function PhotoLayout({ children }) {
    return children;
}
