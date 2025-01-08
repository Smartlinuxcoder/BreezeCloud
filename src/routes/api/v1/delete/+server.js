import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

        const path = filename.split('/');
        const fileTree = locals.user.fileTree;
        let current = fileTree;
        let parent = null;
        let lastKey = null;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                return json({ error: 'File not found' }, { status: 404 });
            }
            parent = current;
            current = current[path[i]].children;
            lastKey = path[i];
        }

        const file = current[path[path.length - 1]];
        if (!file || file.type !== 'file') {
            return json({ error: 'File not found' }, { status: 404 });
        }

        delete current[path[path.length - 1]];

        await db.update(users).set({
            fileTree: fileTree,
            storageUsed: locals.user.storageUsed - file.size
        }).where(eq(users.id, locals.user.id));

        await minioClient.removeObject(MINIO_BUCKET, `${username}/${filename}`);

        return json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return json({ error: 'Failed to delete file' }, { status: 500 });
    }
}