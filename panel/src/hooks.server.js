// src/hooks.server.js
import { jwtVerify } from 'jose';

export async function handle({ event, resolve }) {
    const token = event.cookies.get('token');
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (token) {
        try {
            const { payload } = await jwtVerify(token, jwtSecret);
            event.locals.user = { username: payload.username };
        } catch (err) {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    return await resolve(event);
}
