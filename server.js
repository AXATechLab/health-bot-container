require('dotenv').config();

const helmet = require('helmet')
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const rp = require('request-promise');
const cookieParser = require('cookie-parser');

const app = express();

app.use(helmet());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});

app.get('/chatBot',  function(req, res) {
    const options = {
        method: 'POST',
        uri: 'https://europe.directline.botframework.com/v3/directline/tokens/generate',
        headers: {
            'Authorization': 'Bearer ' + process.env.WEBCHAT_SECRET
        },
        json: true
    };
    rp(options).then(function (parsedBody) {
        let userId = req.query.userId || req.cookies.userid;
        if (!userId) {
            userId = crypto.randomBytes(4).toString('hex');
            res.cookie('userid', userId);
        }

        const response = {
            userId,
            userName: req.query.userName,
            connectorToken: parsedBody.token,
            directLineURI: process.env.DIRECTLINE_ENDPOINT_URI
        };

        const jwtToken = jwt.sign(response, process.env.APP_SECRET);
        res.send(jwtToken);
    }).catch(function (err) {
        console.error('err -> ', err);
        res.status(err.statusCode).send();
        console.log('failed');
    });
});