import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(process.env.COMMIT_HASH || 'unknown'),
	},
});
