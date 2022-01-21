const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const { text } = require('express');

const CLIENT_ID = '464696296845-ihl3bccbkfp6suvobvj3ehe82etk3o48.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04vdSOyaSosumCgYIARAAGAQSNwF-L9IraTCzD8twAH0shQU1hwbijpfjzGMgiNsnr7PpWd48M4dhPZoRKkyDIjGQZxJSeT8aDl8';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({refresh_token : REFRESH_TOKEN});

async function sendMail(email,textt){
    try {
        const at = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                type : 'OAuth2',
                user : 'devendradhote179@gmail.com',
                clientId : CLIENT_ID,
                clientSecret : CLIENT_SECRET,
                refreshToken : REFRESH_TOKEN,
                accessToken : at,
            }
        });

        const mailOptions = {
            from : 'devendradhote179@gmail.com',
            to : email,
            subject : 'hello from google..',
            text : 'hello from google..',
            html : textt,
        };

        const result = await transport.sendMail(mailOptions)
        return result

    } 
    catch (error) {
        return error
    }
}

module.exports = sendMail;
