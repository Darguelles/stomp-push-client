const fetch = require("node-fetch");
let config = require('./config.json')
var FormData = require('form-data');

export class ApigeeCnx {

    generateToken() {

        var params = {
            client_id: config.apigeeClientId,
            client_secret: config.apigeeClientSecret,
            grant_type: config.apigeeGrantType
        };

        var formData = new FormData();

        var formBody = []

        for (var k in params) {
            var encodedKey = encodeURIComponent(k)
            var encodedValue = encodeURIComponent(params[k])
            formBody.push(encodedKey+"="+encodedValue)
            // formData.append(k, params[k]);
        }
        formBody = formBody.join("&");

        let headers = {
            'Content-Type': 'x-www-form-urlencoded; charset=UTF-8'
        }

        fetch(config.apigeeRequestTokenUri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
        })
            .then(response => {
                    if (response.status == '401') {
                        console.log('Bad credentials')
                    }
                    else{
                        console.log(response)
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                        console.log(response.json())
                    }
                }
            )
            .catch(function (error) {
                console.log(error)
            })
    }

}


