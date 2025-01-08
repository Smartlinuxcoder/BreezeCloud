import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
    cookies.delete('auth', { path: '/' });
    throw redirect(302, '/');
};