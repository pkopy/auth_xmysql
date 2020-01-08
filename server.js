const login = require('./login')
const express = require('express')
const api = require('./api')
const cors = require('cors')
const app = express()
const port = 8003
const dotenv = require('dotenv');
const workers = require('./workers')
dotenv.config();

app.use(cors());

app.all('/api/*', (req, res) => {

    api.xmysql(req, res)
});

app.all('/login', (req, res) => {
    login.init(req, res); 
});

app.all('/dynamic', (req, res) => {
    api.xmysql(req, res)
});

app.get('/', (req, res) => {
    res.send('Hello WORLD')
});

workers.init()

app.listen(port, () => console.log(`Proxy app listening on port ${port}!`))