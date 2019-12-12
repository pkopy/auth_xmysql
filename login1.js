const helpers = require('./helpers')
const http = require('http')
const _data = require('./data')
const login = {}

login.init = (req, res) => {
    const method = req.method.toLowerCase();
    const acceptableMethods = ['post'];
    if (acceptableMethods.indexOf(method) > -1) {
        login[method](req, res);
    } else {
        helpers.response(res, 405);
    }
}

//LOGIN POST
//Required data: user, password
login.post = (req, res) => {
    // console.log(req)
    req.on('data', data => {
        // console.log(data)
        let payload = Buffer.from(data).toString();
        const payloadObject = helpers.parseJsonToObject(payload);
        const user = typeof (payloadObject.user) == 'string' && payloadObject.user.trim().length > 0 ? payloadObject.user.trim() : false;
        const password = typeof (payloadObject.password) == 'string' && payloadObject.password.trim().length > 0 ? payloadObject.password.trim() : false;
        if (user && password) {
            const url = 'http://10.10.3.45:3000/api/operator'

            http.get(url, res1 => {
                let body = "";
                res1.setEncoding("utf8");
                res1.on("data", data => {
                    body += data;
                });
                res1.on("end", () => {
                    body = JSON.parse(body);
                    let tokenObject = {}
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    // console.log(body);
                    for (let elem of body) {
                        console.log(elem.name)
                        if (elem.name === user && elem.password === password) {
                            console.log(elem.ID)
                            // id = helpers.createRandomString(20)
                            
                            tokenObject = {
                                user,
                                id: tokenId,
                                expires,
                            };
                            
                            
                            break
                        }
                    }
                    if (tokenObject.id) {

                        _data.create('tokens', tokenId, tokenObject, (err) => {
                            if (!err) {
                              helpers.response(res, 200, tokenObject);
                            } else {
                              helpers.response(res, 500, {'Error': 'Could not create the new token'});
                            }
                        });
                        

                    } else {
                        helpers.response(res, 403, {'Error': 'Missing required field(s)'})
                    }
                });
            });


        } else {
            helpers.response(res, 403, { 'Error': 'Missing required field(s)' });
        }
    });
};

module.exports = login;
