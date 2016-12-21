let Stomp = require('stompjs');
let SockJS = require('sockjs-client')
let config = require('./config.json')

let listener = process.openStdin();

let ws = null;
let client = null;
let subscription = null;

console.log('Enter channel name : ')
listener.addListener("data", function (d) {
    let channel = d.toString().trim()

    if (channel == 'disconnect') {
        console.log('Good bye')
        disconnect()
    } else {
        console.log("Subscribe to channel: [" + channel + "]");
        ws = new SockJS(config.serverRegistrationUri);
        client = Stomp.over(ws);
        client.heartbeat.outgoing = 0;
        client.heartbeat.incoming = 0;

        client.debug = function (str) {
            console.log(str);
        }
        if(subscription){
            unsubscribe();
        }
        var headers = {
            Authorization: "Bearer t96bX93Svtoz3R92ey0eLABsBJhn"
        }
        client.connect(headers, function (frame) {
            console.log('Connected to Stomp');
            console.log('Waiting for messages...')
            subscription = client.subscribe(config.subscriptionPath + channel, successCallback);
        }, showError());
    }
});

function unsubscribe(){
    console.log('Unsubscribe...')
    subscription.unsubscribe()
}

function disconnect(){
    client.disconnect(function(){console.log('Disconnected.')});
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
