import { minioClient } from '$lib/server/s3/index.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || ''; 

        if (!file) {
            return json({ error: 'No file provided' }, { status: 400 });
        }

        if (locals.user.storageUsed + file.size > locals.user.storageQuota) {
            return json({ error: 'Storage quota exceeded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Combine folder path with filename
        const folderPath = folder ? `${folder}/` : '';
        const filename = `${locals.user.username}/${folderPath}${file.name}`;

        const user = locals.user;
        const fileTree = user.fileTree;
        const path = (folder ? folder + '/' + file.name : file.name).split('/');
        let current = fileTree;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {
                    type: 'folder',
                    modified: new Date().toISOString(),
                    children: {}
                };
            }
            current = current[path[i]].children;
        }

        current[path[path.length - 1]] = {
            type: 'file',
            size: file.size,
            mimeType: file.type,
            modified: new Date().toISOString(),
            public: false,
        };

        await db.update(users).set({
            fileTree: fileTree,
            storageUsed: user.storageUsed + file.size
        }).where(eq(users.id, user.id));

        await minioClient.putObject(MINIO_BUCKET, filename, buffer, {
            'Content-Type': file.type,
            'Content-Length': file.size
        });

        return json({
            success: true,
            filename: file.name,
            url: `/${file.name}`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return json({ error: 'Upload failed' }, { status: 500 });
    }
}