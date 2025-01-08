import { db } from '../src/lib/server/db/index.js';
import { users } from '../src/lib/server/db/schema.js';
import { minioClient } from '../src/lib/server/s3/index.js';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

const MINIO_BUCKET = process.env.MINIO_BUCKET;

function createTreeFromPaths(objects) {
  const tree = {};
  
  objects.forEach(obj => {
    const parts = obj.name.split('/');
    const username = parts[0];
    parts.shift(); 
    
    let current = tree;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = {
          type: 'file',
          size: obj.size,
          modified: obj.lastModified
        };
      } else {
        current[part] = current[part] || { type: 'folder', children: {} };
        current = current[part].children;
      }
    });
  });
  
  return tree;
}

async function syncFileTree() {
  try {
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      console.log(`Syncing files for user: ${user.username}`);
      
      const objects = [];
      let totalStorageUsed = 0;
      const objectsList = await minioClient.listObjects(MINIO_BUCKET, `${user.username}/`, true);
      
      for await (const obj of objectsList) {
        objects.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified
        });
        totalStorageUsed += obj.size;
      }
      
      const fileTree = createTreeFromPaths(objects);
      console.log(`Storage used by ${user.username}: ${totalStorageUsed} bytes`);
      
      await db.update(users)
        .set({ 
          fileTree,
          storageUsed: totalStorageUsed 
        })
        .where(eq(users.username, user.username));
        
      console.log(`Updated file tree and storage usage for ${user.username}`);
    }
    
    console.log('File tree sync completed successfully');
  } catch (error) {
    console.error('Error syncing file tree:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

syncFileTree();