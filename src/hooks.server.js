import { jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function handle({ event, resolve }) {
    const token = event.cookies.get('auth');
    const jwtSecret = env.JWT_SECRET;
    const secret = new TextEncoder().encode(jwtSecret);

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            const [userData] = await db.select().from(users).where(eq(users.username, payload.username));

            if (userData) {
                event.locals.user = {
                    id: userData.id,
                    username: userData.username,
                    storageQuota: userData.storageQuota,
                    storageUsed: userData.storageUsed,
                    fileTree: userData.fileTree
                };
                console.log('User:', event.locals.user);
            } else {
                event.locals.user = null;
                event.cookies.delete('auth', { path: '/' });
            }
            
        } catch (err) {
            event.locals.user = null;
            console.error('Error:', err);
            event.cookies.delete('auth', { path: '/' });
        }
    } else {
        event.locals.user = null;
    }

    return await resolve(event);
}