import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { folderPath } = await request.json();

        if (!folderPath) {
            return json({ error: 'No folder path provided' }, { status: 400 });
        }

        const user = locals.user;
        const fileTree = user.fileTree;
        const path = folderPath.split('/');
        let current = fileTree;

        for (let i = 0; i < path.length; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {
                    type: 'folder',
                    modified: new Date().toISOString(),
                    children: {}
                };
            }
            if (i < path.length - 1) {
                current = current[path[i]].children;
            }
        }

        await db.update(users).set({
            fileTree: fileTree
        }).where(eq(users.id, user.id));

        return json({
            success: true,
            path: folderPath
        });

    } catch (error) {
        console.error('Folder creation error:', error);
        return json({ error: 'Folder creation failed' }, { status: 500 });
    }
}