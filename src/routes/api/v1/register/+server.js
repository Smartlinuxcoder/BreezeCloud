import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { email, password, username, fullName } = body;

        if (!email || !password || !username || !fullName) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length > 0) {
            return json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                username,
                fullName,
            })
            .returning({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
            });

        return json({ user: newUser });
    } catch (error) {
        if (error.code === '23505') {
            return json({ success: false, message: 'Username or email already exists.' }, { status: 400 });
        }
        console.error(error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
