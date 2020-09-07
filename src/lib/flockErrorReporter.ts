
import * as _ from "lodash";

const bunyan = require("bunyan");
import * as config from "@config/environment";
import * as request from 'request';
import fetch from 'node-fetch';

export let errorReporter = async (data) => {
    try {
        console.log('config.get,config.get,', config.SERVER.flockApi, data);

        // let formatedMessage = `<flockml><strong>${process.env.NODE_ENV.toUpperCase()} : ${errorMessage.title}</strong><br/>${typeof errorMessage.err == 'object' ? JSON.stringify(errorMessage.err) : errorMessage.err}</flockml>`;

        let formatedMessage = `<flockml><strong>${config.SERVER.ENVIRONMENT.toUpperCase()} : ${JSON.stringify(data)}</flockml>`;

        var postBody = {
            url: config.SERVER.flockApi,
            body: JSON.stringify({ flockml: formatedMessage }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        request.post(postBody, function (error, response, body) {
            if (error) {
                console.log('error:', error);
            }
            else {
                console.log('body', body);
            }
        });

    } catch (error) {
        console.log('Error inside errorReporter', error);
    }
}