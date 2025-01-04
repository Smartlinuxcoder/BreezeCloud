import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'thisIsReallyUnsecureHuh';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET({ cookies }) {
    try {
        const token = cookies.get('auth');
        if (!token) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        let payload;
        try {
            const { payload: verified } = await jose.jwtVerify(token, secretKey);
            payload = verified;
        } catch (error) {
            return json({ error: 'Invalid token' }, { status: 401 });
        }

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
            })
            .from(users)
            .where(eq(users.id, payload.id));

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({ user });
    } catch (error) {
        console.error(error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
