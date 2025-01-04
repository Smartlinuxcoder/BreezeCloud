export function load({ locals }) {
  if (locals.user) {
    return {
      user: locals.user.username
    }
  }
}