import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { filePath, isPublic } = await request.json();

        if (!filePath) {
            return json({ error: 'No file path provided' }, { status: 400 });
        }

        const user = locals.user;
        const fileTree = user.fileTree;
        const path = filePath.split('/');
        let current = fileTree;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                return json({ error: 'File not found' }, { status: 404 });
            }
            current = current[path[i]].children;
        }

        const fileName = path[path.length - 1];
        if (!current[fileName] || current[fileName].type !== 'file') {
            return json({ error: 'File not found' }, { status: 404 });
        }

        current[fileName].public = isPublic;

        await db.update(users)
            .set({ fileTree: fileTree })
            .where(eq(users.id, user.id));

        return json({
            success: true,
            message: `File visibility updated successfully`
        });

    } catch (error) {
        console.error('Visibility update error:', error);
        return json({ error: 'Failed to update file visibility' }, { status: 500 });
    }
}