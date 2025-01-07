import * as Minio from 'minio'
import 'dotenv/config'

export const minioClient = new Minio.Client({  
    endPoint: process.env.MINIO_HOSTNAME || 'minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_SSL === 'true',
    accessKey: process.env.MINIO_ACCESSKEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRETKEY || 'minioadmin'
  });