import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'thisIsReallyUnsecureHuh';

export async function POST({ request, cookies }) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({
            id: user.id,
            email: user.email,
            timestamp: Date.now(),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        cookies.set('auth', token, {
            httpOnly: true,
            maxAge: 7 * 86400, // 7 days
            path: '/',
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
