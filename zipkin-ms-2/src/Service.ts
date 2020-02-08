import express from 'express';
import bodyParser from 'body-parser';

import axios from 'axios';
import CLSContext from 'zipkin-context-cls';
import {Tracer} from 'zipkin';
import wrapAxios from 'zipkin-instrumentation-axiosjs';
import {ZipkinRecorder} from './ZipkinRecorder';

const zipkinRecorder = new ZipkinRecorder();
const ctxImpl = new CLSContext();

const localServiceName = 'zipkin-ms-2';
const tracer = new Tracer({ctxImpl, recorder: zipkinRecorder.recorder(localServiceName), localServiceName});

const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const zipkinAxios = wrapAxios(axios, {tracer});

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(zipkinMiddleware({tracer}));

app.post('/api/v1/callMe', function (req, res) {

    req.body.services.push(localServiceName);

    tracer.recordMessage("Got a request to call the zipkin-ms-3 service");
    tracer.local('Invoking zipkin-ms-3', () => {
        zipkinAxios.post(`${process.env.ZIPKIN_MS_3_URI}/api/v1/callMe`, {"requestDate": new Date(), "services":req.body.services})
            .then(response => {
                res.json(response.data);
            })
            .catch(err => {
                console.error('Error', err.response ? err.response.status : err.message)
            })
    });

});

app.listen(port, () => {
    console.log(`zipkin-ms-2 listening on port ${port}!`);
});
