/* import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { auth } from './src/api/auth.js'



if (!process.env.JWT_SECRET){
    console.error('JWT_SECRET is not set');
}
const port = process.env.SERVER_PORT || 3000
new Elysia()
    .use(auth)
    .use(staticPlugin({
        assets: 'frontend/dist',
        prefix: '/'
    }))
     .get('/john', 'Hello World')
    .listen(port)


console.log(`Listening on port ${port}`) */

const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOSTNAME,
  port: process.env.MINIO_PORT,                
  useSSL: process.env.MINIO_SSL==='true', 
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY
});

minioClient.fPutObject('cloud', 'myfile.txt', './myfile.txt', (err, etag) => {
    if (err) return console.log(err);
    console.log('File uploaded successfully. ETag:', etag);
  });
  
  minioClient.getObject('cloud', 'myfile.txt', (err, dataStream) => {
    if (err) return console.log(err);
    dataStream.pipe(process.stdout);
  });