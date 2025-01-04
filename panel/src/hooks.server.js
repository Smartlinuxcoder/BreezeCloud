// src/hooks.server.js
import { jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
    const token = event.cookies.get('auth');
    const jwtSecret = env.JWT_SECRET;
    const secret = new TextEncoder().encode(jwtSecret);

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            event.locals.user = { username: payload.username };
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
