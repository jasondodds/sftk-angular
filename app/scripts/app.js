'use strict';
var errorObject;
//Route definitions
var app = angular.module('AngularApp', ['AngularApp.controllers']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {controller: 'HomeCtrl', templateUrl: '../views/home.html'}).
      when('/login', {controller: 'LoginCtrl', templateUrl: '../views/login.html'}).
      when('/logout', {controller: 'LoginCtrl', templateUrl: '../views/logout.html'}).
      when('/callback', {controller: 'CallbackCtrl', templateUrl: '../views/callback.html'}).
      when('/contacts', {controller: 'ContactListCtrl', templateUrl: '../views/contact/list.html'}).
      when('/view/contact/:contactId', {controller: 'ContactViewCtrl', templateUrl: '../views/contact/view.html'}).
      when('/edit/contact/:contactId', {controller: 'ContactDetailCtrl', templateUrl: '../views/contact/edit.html'}).
      when('/new/contact', {controller: 'ContactDetailCtrl', templateUrl: '../views/contact/edit.html'}).
      when('/accounts', {controller: 'AccountListCtrl', templateUrl: '../views/account/list.html'}).
      when('/view/account/:accountId', {controller: 'AccountViewCtrl', templateUrl: '../views/account/view.html'}).
      when('/edit/account/:accountId', {controller: 'AccountDetailCtrl', templateUrl: '../views/account/edit.html'}).
      when('/new/account', {controller: 'AccountDetailCtrl', templateUrl: '../views/account/edit.html'}).
      otherwise({redirectTo: '/'});

  }]);

//Salesforce object definitions via AngularForce
angular.module('Contact', []).factory('Contact', function (AngularForceObjectFactory) {
    var Contact = new AngularForceObjectFactory({type: 'Contact', fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id'], where: '', limit: 20});
    return Contact;
});

angular.module('Account', []).factory('Account', function (AngularForceObjectFactory) {
    var Account = new AngularForceObjectFactory({type: 'Account', fields: ['Id', 'Name'], where: '', limit: 50});
    return Account;
});

//Init app for Salesforce Authentication
function initApp(options, forcetkClient) {
    options = options || {};
    options.loginUrl = SFConfig.sfLoginURL;
    options.clientId = SFConfig.consumerKey;
    options.apiVersion = 'v27.0';
    options.userAgent = 'SalesforceMobileUI/alpha';
    options.proxyUrl = options.proxyUrl || SFConfig.proxyUrl;

    //In VF, you should get sessionId and use that as accessToken while initializing forcetk(Force.init)
    if (SFConfig.sessionId) {
        options.accessToken = SFConfig.sessionId;
    }

    //Init force
    Force.init(options, options.apiVersion, forcetkClient);
}

//Generate config object to be used by ForceTK
function getSFConfig() {
    var location = document.location;
    var href = location.href;
    if (href.indexOf('file:') >= 0) { //Phonegap
        return {};
    } else if (configFromEnv && configFromEnv.sessionId) { //VisualForce just sets sessionId (as that's all what is required)
        return {
            sessionId: configFromEnv.sessionId
        };
    } else {
        if (!configFromEnv || configFromEnv.client_id === '' || configFromEnv.client_id === 'undefined' || configFromEnv.app_url === '' || configFromEnv.app_url === 'undefined') {
            throw 'Environment variable client_id and/or app_url is missing. Please set them before you start the app';
        }
        return {
            sfLoginURL: 'https://login.salesforce.com/',
            consumerKey: configFromEnv.client_id,
            oAuthCallbackURL: removeTrailingSlash(configFromEnv.app_url) + '/#/callback',
            proxyUrl: removeTrailingSlash(configFromEnv.app_url) + '/proxy/'
        };
    }
}


//Helper to properly formate URL's 
function removeTrailingSlash(url) {
    return url.replace(/\/$/, '');
}

var SFConfig = getSFConfig();

SFConfig.maxListSize = 25;
app.constant('SFConfig', SFConfig);