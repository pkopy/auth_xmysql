const crypto = require('crypto');
const _data = require('./data');



const helpers = {};

helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', 'tajnysuperklucz').update(str).digest('hex');
        return hash
    } else {
        return false
    }
};

helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

helpers.createRandomString = (strLength) => {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        //Define all posaible character that could go to the string
        const posaibleCharacters = 'abcdefghijklmnoprstquwyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ';
        //Start the final string

        let str = '';
        for (i = 1; i <= strLength; i++) {
            const randomCharacter = posaibleCharacters.charAt(Math.floor(Math.random() * posaibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    }
};


helpers.response = (response, statusCode, payload) => {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });
    const payloadString = JSON.stringify(payload);
    response.end(payloadString)
};



helpers.verifyToken = (id, user, callback) => {
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            //Check that the token is for the given user, and  has not expired
            tokenData = helpers.parseJsonToObject(tokenData)
            if (tokenData.user == user && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};





module.exports = helpers
