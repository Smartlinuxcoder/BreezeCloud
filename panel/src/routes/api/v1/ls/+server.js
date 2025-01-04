import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function GET({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const username = locals.user.username;


    try {
        const objectsList = await minioClient.listObjects(MINIO_BUCKET, `${username}/`, true);
        const files = [];

        for await (const obj of objectsList) {
            files.push({
                name: obj.name,
                size: obj.size,
                lastModified: obj.lastModified
            });
        }

        return json({ files });
    } catch (error) {
        console.error('List error:', error);
        return json({ error: 'Failed to list files' }, { status: 500 });
    }
}