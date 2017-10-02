import dns from 'dns'

export default function (opts) {

    return async function ipInfo(ctx, next) {
        
        let ip = await getIp(ctx)
        let reverse = await ipReverse(ip)
        let family = await familyIp(ip)

        ctx.set("x-reverse-ip", reverse)
        ctx.set("x-family-ip", family)

        return next()
    }
}

async function ipReverse(ip) {
    return new Promise(function (resolve, reject) {
        dns.reverse(ip, (err, hostnames) => {
            if (err) {
                reject(err)
            }
            resolve(hostnames)
        })
    })
}

async function familyIp(ip) {
    return new Promise(function (resolve, reject) {
        dns.lookup(ip, (err, address, family) => {
            if (err) {
                reject(err)
            }
            resolve(family)
        })
    })
}

async function getIp(ctx){
    let ip
    if(ctx.request.ip){
        ip = ctx.request.ip
        ip = (ip.substr(0, 7) === "::ffff:") ? ip.substr(7) : ip
    }
    else if (ctx.request.header['x-forwarded-for']){
        ip = ctx.request.header['x-forwarded-for']
        ip = ip.split(',')
        ip = ip[ip.length-1]
        ip = (ip.indexOf(':') >= 0) ? ip.substr(0, ip.indexOf(':')) : ip
    }
    else if (ctx.ip){
        ip = ctx.ip
        ip = (ip.substr(0, 7) === "::ffff:") ? ip.substr(7) : ip
    }
    return ip
}