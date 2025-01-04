import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${locals.user.username}/${file.name}`;

        await minioClient.putObject(MINIO_BUCKET, filename, buffer, {
            'Content-Type': file.type,
            'Content-Length': file.size
        });

        return json({
            success: true,
            filename: file.name,
            url: `/uploads/${file.name}`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return json({ error: 'Upload failed' }, { status: 500 });
    }
}