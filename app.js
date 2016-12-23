let Stomp = require('stompjs');
let SockJS = require('sockjs-client')
let config = require('./config.json')
let listener = process.openStdin();
let current_token = null;
let ws = null;
let client = null;
let subscription = null;

const request = require('request-promise')
const getTokenParams = {
    method: 'POST',
    url: config.apigeeRequestTokenUri,
    headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json'
    },
    form: {
        client_secret: config.apigeeClientSecret,
        grant_type: config.apigeeGrantType,
        client_id: config.apigeeClientId
    }
};


console.log('Enter channel name : ')
listener.addListener("data", function (d) {

    let channel = d.toString().trim()

    if (channel == 'generate token') {
        generateToken();
    }
    else if (channel.startsWith('subscribe')) {
        var channelselected = channel.split(' ')
        console.log("Subscribing to channel: [" + channelselected[1] + "]");
        ws = new SockJS(config.serverRegistrationUri);
        client = Stomp.over(ws);
        client.heartbeat.outgoing = 0;
        client.heartbeat.incoming = 0;

        client.debug = function (str) {
            console.log(str);
        }
        if (subscription) {
            unsubscribe();
        }
        var headers = {
            Authorization: "Bearer t96bX93Svtoz3R92ey0eLABsBJhn"
        }
        client.connect(headers, function (frame) {
            console.log('Connected to Stomp');
            console.log('Waiting for messages...')
            subscription = client.subscribe(config.subscriptionPath + channelselected[1], successCallback);
        }, showError());
    }
    else if (channel.startsWith('send')) {
        sendMessage(JSON.stringify({
            "from": "El perrito",
            "content": "Hi cinescape"
        }), 'Verizon')
    }
    else if (channel == 'disconnect') {
        console.log('Good bye')
        disconnect()
    }
});

function unsubscribe() {
    console.log('Unsubscribe...')
    subscription.unsubscribe()
}

function disconnect() {
    client.disconnect(function () {
        console.log('Disconnected.')
    });
}

let successCallback = function (message) {
    if (message.body) {
        showMessage(message.body)
    } else {
        showError();
    }
};

function showMessage(message) {
    console.log('Upcoming content.........................')
    console.log("RECEIVED MESSAGE AT :  " + new Date().toLocaleString('en-US', {hour12: false}));
    console.log(message)
}

function showError() {
    console.log('ERROR ON CONNECTION');
}

function generateToken() {
    request(getTokenParams)
        .then(response => {
            response = JSON.parse(response)
            current_token = response['access_token']
        })
        .catch(function (error) {
            if (error) {
                console.log(error)
            }
        });
}

function sendMessage(message, channel) {
    let options = {
        method: 'POST',
        url: config.sendMessageUri + channel,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            authorization: 'Beareer ' + current_token
        },
        body: message
    };
    request(options)
        .then(response => {
            response = JSON.parse(response)
            console.log(response)
            console.log('-------------------------------------------')
            console.log(response.body)
            console.log(response.statusCode)
        })
        .catch(error => console.log(error))
}
