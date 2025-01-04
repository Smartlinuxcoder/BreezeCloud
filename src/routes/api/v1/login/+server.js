import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { env } from '$env/dynamic/private';

const JWT_SECRET = env.JWT_SECRET;

export async function POST({ request, cookies }) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const [user] = await db.select().from(users).where(eq(users.username, username));

        if (!user) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }
        console.log('JWT_SECRET:', JWT_SECRET);
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({
            id: user.id,
            username: user.username,
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);
        cookies.set('auth', token, {
            httpOnly: true,
            maxAge: 7 * 86400, // 7 days
            path: '/',
            secure: true,
        });

        return json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
