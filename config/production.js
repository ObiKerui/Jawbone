module.exports = {

  	//api keys and secret
  	PORT: process.env.PORT || 80,
  	DB_URL : process.env.DB_URL,

	ids : {

	    'jawboneAuth' : {
	        'clientID': process.env.JB_CLIENT_ID,
	        'clientSecret': process.env.JB_CLIENT_SECRET,
	        'authorizationURL': 'https://jawbone.com/auth/oauth2/auth',
	        'tokenURL': 'https://jawbone.com/auth/oauth2/token',
	        'callbackURL': process.env.JB_CB_URL
	    },

	    'facebookAuth' : {
	        'clientID'      : process.env.FB_CLIENT_ID, // your App ID
	        'clientSecret'  : process.env.FB_CLIENT_SECRET, // your App Secret
	        'callbackURL'   : process.env.FB_CB_URL
	    },

	    'twitterAuth' : {
	        'consumerKey'       : process.env.TW_CLIENT_KEY,
	        'consumerSecret'    : process.env.TW_CLIENT_SECRET,
	        'callbackURL'       : process.env.TW_CB_URL
	    },

	    'googleAuth' : {
	        'clientID'      : process.env.GO_CLIENT_ID,
	        'clientSecret'  : process.env.GO_CLIENT_SECRET,
	        'callbackURL'   : process.env.GO_CB_URL
	    }
	},

	//--------------------------------------------------------------
	// JAWBONE IDS OF ADMINISTRATORS
	//--------------------------------------------------------------
	jboneAdminIds : [
		'-9VI7q6PJcrBConjPPsftA'
	],

	//--------------------------------------------------------------
	// JAWBONE IDS OF PATIENTS
	//--------------------------------------------------------------
	jbonePatientIds : [
	]	
};