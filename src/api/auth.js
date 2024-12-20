import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const auth = new Elysia()
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET || "thisIsReallyUnsecureHuh",
        })
    )
    .use(cookie());

auth.post(
    "/api/v1/register",
   
    async ({ body, set }) => {
        try {
            const { email, password, username, fullName } = body;
            if (!email || !password || !username || !fullName) {
                set.status = 400;
                return { error: "Missing required fields" };
            }
            const existingUser = await db.select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existingUser.length > 0) {
                set.status = 409;
                return { error: "User already exists" };
            }

            const hashedPassword = await Bun.password.hash(password);

            const [newUser] = await db.insert(users)
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

            return { user: newUser };
        } catch (error) {
            if (error.code === '23505') {
                set.status = 400;
                return { success: false, message: 'Username or email already exists.' };
            }
            console.error(error);
            set.status = 500;
            return { error: "Internal server error" };
        }
    }
);

auth.post(
    "/api/v1/login",
    async ({ body, jwt, cookie, set }) => {
        const { email, password } = body;

        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email));

        if (!user) {
            set.status = 401;
            return { error: "Invalid credentials" };
        }

        const validPassword = await Bun.password.verify(password, user.password);
        if (!validPassword) {
            set.status = 401;
            return { error: "Invalid credentials" };
        }

        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            timestamp: Date.now(),
        });

        cookie.auth.set({
            value: token,
            httpOnly: true,
            maxAge: 7 * 86400, // 7 days
            path: "/",
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
            },
            token,
        };
    }
);

auth.get("/api/v1/me", async ({ jwt, cookie, set }) => {
    const token = cookie.auth.value;
    if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
    }

    const payload = await jwt.verify(token);
    if (!payload) {
        set.status = 401;
        return { error: "Invalid token" };
    }

    const [user] = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
    })
        .from(users)
        .where(eq(users.id, payload.id));

    if (!user) {
        set.status = 404;
        return { error: "User not found" };
    }

    return { user };
});