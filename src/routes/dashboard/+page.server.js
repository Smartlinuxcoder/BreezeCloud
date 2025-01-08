import { redirect } from '@sveltejs/kit';
import { minioClient } from '$lib/server/s3/index.js';
import { env } from '$env/dynamic/private';

const MINIO_BUCKET = env.MINIO_BUCKET;

export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(301, '/login');
  }

  try {
    const objectsList = await minioClient.listObjects(MINIO_BUCKET, `${locals.user.username}/`, true);
    const files = [];

    for await (const obj of objectsList) {
      files.push({
        name: obj.name.split('/').pop(),
        path: obj.name,
        size: obj.size,
        lastModified: obj.lastModified
      });
    }
    return {
      pageName: 'Your files',
      files: locals.user.fileTree,
      user: locals.user
    };
  } catch (error) {
    return {
      pageName: 'Error while loading files',
      files: [],
      error: 'Failed to load files'
    };
  }
}