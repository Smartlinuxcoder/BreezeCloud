import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function GET({ request, locals, url }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const filename = url.searchParams.get('file');
    if (!filename) {
        return json({ error: 'No filename provided' }, { status: 400 });
    }

    const fullPath = `${locals.user.username}/${filename}`;

    try {
        const stat = await minioClient.statObject(MINIO_BUCKET, fullPath);
        
        const fileStream = await minioClient.getObject(MINIO_BUCKET, fullPath);

        const headers = new Headers({
            'Content-Type': stat.metaData['content-type'] || 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': `attachment; filename="${filename}"`,
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