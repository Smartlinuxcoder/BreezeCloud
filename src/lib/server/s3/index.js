import * as Minio from 'minio'
import 'dotenv/config'

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOSTNAME,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_SSL === 'true',
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY
});