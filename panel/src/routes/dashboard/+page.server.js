import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  if (!locals.user) {
    throw redirect(301, '/login');
  }

  return {
    pageName: 'Dashboard'
  };
}