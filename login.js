const helpers = require('./helpers')
const http = require('http')
const _data = require('./data')
const login = {}
const { USER, PASSWORD } = require('./config');
const config = {
    user: USER,
    password: PASSWORD
}

const dotenv = require('dotenv');
dotenv.config();

// login.init = () =>  {
//     console.log('admin:',helpers.hash('admin'))
//     console.log('admin:',helpers.hash('kasztanySomSuper'))
// }

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
            let tokenObject = {}
            const tokenId = helpers.createRandomString(20);
            const expires = Date.now() + 1000 * 60 * 60;
            if (helpers.hash(user) === config.user && helpers.hash(password) === config.password) {
                tokenObject = {
                    user,
                    id: tokenId,
                    expires,
                };
            }

            if (tokenObject.id) {

                _data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        helpers.response(res, 200, tokenObject);
                    } else {
                        helpers.response(res, 500, { 'Error': 'Could not create the new token' });
                    }
                });


            } else {
                helpers.response(res, 403, { 'Error': 'User or password not match' })
            }
        } else {
            helpers.response(res, 403, { 'Error': 'Missing required field(s)' });
        }

        
    });
};

module.exports = login;
