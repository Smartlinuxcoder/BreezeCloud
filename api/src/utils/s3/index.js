const Minio = require('minio');

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOSTNAME,
    port: process.env.MINIO_PORT,
    useSSL: process.env.MINIO_SSL === 'true',
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY
});

/* minioClient.fPutObject('cloud', 'myfile.txt', './myfile.txt', (err, etag) => {
    if (err) return console.log(err);
    console.log('File uploaded successfully. ETag:', etag);
});

minioClient.getObject('cloud', 'myfile.txt', (err, dataStream) => {
    if (err) return console.log(err);
    dataStream.pipe(process.stdout);
});

 */