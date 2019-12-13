const helpers = require('./helpers')
const http = require('http')
const url = require('url')

const api = {}

api.xmysql = (req, res) => {
    const method = req.method.toLowerCase();
    const acceptableMethods = ['get', 'post', 'put', 'delete', 'patch'];

    if (acceptableMethods.indexOf(method) > -1) {
        console.log(method)
        if (method !== 'get' ) {
            api.sendBody(req, res, method)
        } else {

            api.get(req, res);
        }
    } else {
        helpers.response(res, 405);
    }
    // 
}

api.get = (req, res) => {
    const user = typeof (req.headers.user) == 'string' && req.headers.user.trim().length > 0 ? req.headers.user.trim() : false;
    const token = typeof (req.headers.token) == 'string' && req.headers.token.trim().length === 20 ? req.headers.token.trim() : false;
    const url = `http://10.10.3.45:3000${req.url}`

    if (user, token) {
        helpers.verifyToken(token, user, (tokenIsValid) => {
            if (tokenIsValid) {
                http.get(url, { method: req.method }, xMsql => {
                    let body = "";
                    xMsql.setEncoding("utf8");
                    xMsql.on("data", data => {
                        body += data;
                    });
                    xMsql.on('end', () => {
                        body = helpers.parseJsonToObject(body);
                        helpers.response(res, 200, body)
                    })
                })
            } else {
                helpers.response(res, 200, { "error": "token is not valid" })
            }
        })
    } else {
        helpers.response(res, 403, { 'Error': 'Missing required field(s)' });
    }
}

api.sendBody = (req, res, method) => {
    const user = typeof (req.headers.user) == 'string' && req.headers.user.trim().length > 0 ? req.headers.user.trim() : false;
    const token = typeof (req.headers.token) == 'string' && req.headers.token.trim().length === 20 ? req.headers.token.trim() : false;
    let chunks = [];
    req.on('data', data => {
        // const payload = Buffer.from(data).toString();
        // const payloadObject = helpers.parseJsonToObject(payload);  
        chunks.push(data)
    })
        .on('end', () => {
            const data = Buffer.concat(chunks)
            // const payloadObj = JSON.parse(data.toString())
            const payloadObj = data.toString()
            // console.log()
            const options = {
                hostname: '10.10.3.45',
                port: 3000,
                path: req.url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            if (user, token) {
                helpers.verifyToken(token, user, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // console.log(JSON.parse(payloadObj))
                        let chunksR = []
                        const request = http.request(options, (resp) => {
                            console.log(`STATUS: ${res.statusCode}`);
                            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                            resp.setEncoding('utf8');
                            resp.on('data', (chunk) => {
                                console.log(`BODY: ${chunk}`);
                                chunksR.push(chunk)
                            });
                            resp.on('end', () => {
                                console.log('No more data in response.');
                                
                                const objToSend = helpers.parseJsonToObject(chunksR[0])
                                helpers.response(res, 200, objToSend )
                            });
                        });

                        request.on('error', (e) => {
                            console.error(`problem with request: ${e.message}`);
                            
                        });

                        request.setTimeout(10000, (e) => {
                            console.log('timeout problem')
                            helpers.response(res, 408, {'error':'timeout'} )
                        })

                        // Write data to request body
                        if (method !== 'delete') {
                            request.write(payloadObj);

                        }
                        request.end();
                        
                    } else {
                        helpers.response(res, 401, { "error": "token is not valid" })
                    }
                })
            } else {
                helpers.response(res, 401, { 'Error': 'Missing required field(s)' });
            }
        })

};





module.exports = api;