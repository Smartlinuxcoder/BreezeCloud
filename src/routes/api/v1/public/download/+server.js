import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function GET({ url }) {
    const filePath = url.searchParams.get('file');
    if (!filePath) {
        return json({ error: 'No file path provided' }, { status: 400 });
    }

    const [username, ...pathParts] = filePath.split('/').filter(Boolean);
    const filename = pathParts.join('/');

    try {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1).then(rows => rows[0]);

        if (!user) {
            return json({ error: 'File not found' }, { status: 404 });
        }

        let current = user.fileTree;
        const parts = filename.split('/');
        
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]] || current[parts[i]].type !== 'folder') {
                return json({ error: 'File not found' }, { status: 404 });
            }
            current = current[parts[i]].children;
        }

        const file = current[parts[parts.length - 1]];
        
        // Check if file exists and is public
        if (!file || file.type !== 'file' || !file.public) {
            return json({ error: 'File not found' }, { status: 404 });
        }

        // Get and stream the file
        const stat = await minioClient.statObject(MINIO_BUCKET, filePath);
        const fileStream = await minioClient.getObject(MINIO_BUCKET, filePath);

        const headers = new Headers({
            'Content-Type': stat.metaData['content-type'] || 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': `inline; filename="${parts[parts.length - 1]}"`,
        });

        return new Response(fileStream, { headers });

    } catch (error) {
        console.error('Download error:', error);
        if (error.code === 'NoSuchKey') {
            return json({ error: 'File not found' }, { status: 404 });
        }
        return json({ error: 'Download failed' }, { status: 500 });
    }
}