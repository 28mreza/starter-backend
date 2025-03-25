const Memcached = require('memcached')

/* Initialize memcached connection */
const memcached = new Memcached('172.19.1.15:11211')

/* Login Function (Store Token in Memcached) */
export const storeToken = (prefix: any, userId: any, token: any) => {
    memcached.set(`${prefix}_${userId}`, JSON.stringify(token), 86400, function (err: any) {
        if (err) throw err;
        console.log(`Token stored for user ${userId}`)
    });
}

/* Middleware for validating token from API requests */
export const validateToken = (prefix: any, userId: any, tokenFromRequest: any) => {
    memcached.get(`prefix_${userId}`, function (err: any, storedToken: any) {
        if (err) throw err
        if (storedToken === tokenFromRequest) {
            return true
        } else {
            return false
        }
    })
}



export default {
    storeToken,
    validateToken
} 
