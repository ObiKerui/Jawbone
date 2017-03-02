
// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:5000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:5000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '763529532808-29fbg8cc2i2bgbul48o8sfhu20155ccv.apps.googleusercontent.com',
        'clientSecret'  : 'CqRaHL_5YFLDEoXQUwl-k73o',
        'callbackURL'   : 'https://localhost:5000/auth/google/callback'
    }

};