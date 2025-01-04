import * as Minio from 'minio'
import { env } from '$env/dynamic/private';

export const minioClient = new Minio.Client({
    endPoint: env.MINIO_HOSTNAME,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_SSL === 'true',
    accessKey: env.MINIO_ACCESSKEY,
    secretKey: env.MINIO_SECRETKEY
});