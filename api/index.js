import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { auth } from './src/api/auth.js'



if (!process.env.JWT_SECRET){
    console.error('JWT_SECRET is not set');
}
const port = process.env.SERVER_PORT || 3000
new Elysia()
    .use(auth)
    /* .use(staticPlugin({
        assets: 'frontend/dist',
        prefix: '/'
    })) */
     .get('/john', 'Hello World')
    .listen(port)


console.log(`Listening on port ${port}`) 

