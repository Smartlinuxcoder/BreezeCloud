import { Elysia } from 'elysia';
import { db } from '../utils/db';
import { eq } from 'drizzle-orm';

export const upload = new Elysia();

upload.post('/api/v1/upload', async ({ body, set }) => {
    const { file } = body;
    if (!file) {
        set.status = 400;
        return { error: 'No file uploaded' };
    }
    //TODO
});