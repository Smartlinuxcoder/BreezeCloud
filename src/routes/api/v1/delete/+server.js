import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function DELETE({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const username = locals.user.username;

    try {
        const { filename } = await request.json();

        if (!filename) {
            return json({ error: 'Filename is required' }, { status: 400 });
        }

/*         if (!filename.startsWith(`${username}/`)) {
            return json({ error: 'Unauthorized access' }, { status: 403 });
        } */

        await minioClient.removeObject(MINIO_BUCKET, `${username}/${filename}`);

        return json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return json({ error: 'Failed to delete file' }, { status: 500 });
    }
}