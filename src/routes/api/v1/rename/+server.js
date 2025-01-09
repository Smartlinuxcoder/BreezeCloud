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
        const { oldPath, newPath } = await request.json();

        if (!oldPath || !newPath) {
            return json({ error: 'Old path and new path are required' }, { status: 400 });
        }

        const user = locals.user;
        const fileTree = user.fileTree;

        function removeFromPath(tree, pathArray) {
            let current = tree;
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (!current[pathArray[i]]) return null;
                current = current[pathArray[i]].children;
            }
            const item = current[pathArray[pathArray.length - 1]];
            delete current[pathArray[pathArray.length - 1]];
            return item;
        }

        function addToPath(tree, pathArray, item) {
            let current = tree;
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (!current[pathArray[i]]) {
                    current[pathArray[i]] = {
                        type: 'folder',
                        modified: new Date().toISOString(),
                        children: {}
                    };
                }
                current = current[pathArray[i]].children;
            }
            current[pathArray[pathArray.length - 1]] = item;
        }

        const oldPathArray = oldPath.split('/');
        const newPathArray = newPath.split('/');
        const item = removeFromPath(fileTree, oldPathArray);

        if (!item) {
            return json({ error: 'File or folder not found' }, { status: 404 });
        }

        item.modified = new Date().toISOString();
        addToPath(fileTree, newPathArray, item);

        const oldKey = `${locals.user.username}/${oldPath}`;
        const newKey = `${locals.user.username}/${newPath}`;

        if (item.type === 'file') {
            await minioClient.copyObject(
                MINIO_BUCKET,
                newKey,
                `/${MINIO_BUCKET}/${oldKey}`
            );
            await minioClient.removeObject(MINIO_BUCKET, oldKey);
        }

        await db.update(users)
            .set({ fileTree: fileTree })
            .where(eq(users.id, user.id));

        return json({
            success: true,
            newPath: newPath
        });

    } catch (error) {
        console.error('Rename error:', error);
        return json({ error: 'Rename failed' }, { status: 500 });
    }
}