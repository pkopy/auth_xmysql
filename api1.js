const helpers = require('./helpers')
const http = require('http')
const api = {}


api.init = (req, res) => {
    const method = req.method.toLowerCase();
    const acceptableMethods = ['post'];
    if (acceptableMethods.indexOf(method) > -1) {
        api[method](req, res);
    } else {
        helpers.response(res, 405);
    }
};
api.post = (req, res) => {
    


        req.on('data', data => {
            let payload = Buffer.from(data).toString();
            const payloadObject = helpers.parseJsonToObject(payload);
            const user = typeof (payloadObject.user) == 'string' && payloadObject.user.trim().length > 0 ? payloadObject.user.trim() : false;
            const token = typeof (payloadObject.token) == 'string' && payloadObject.token.trim().length === 20 ? payloadObject.token.trim() : false;
            console.log(payload)
            console.log(req.path)
            const url = `http://10.10.3.45:3000${req.path}`

            if (user && token) {
                helpers.verifyToken(token, user, (tokenIsValid) => {
                    if (tokenIsValid) {
                        http.get(url, xMsql => {
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
                helpers.response(res, 200, { "error": "missing require field(s)" })
            }
        })
    

}

// api.get = (req, res) => {
//     helpers.response(res, 200, { "error": "missing require field(s)" })
// }

module.exports = api;