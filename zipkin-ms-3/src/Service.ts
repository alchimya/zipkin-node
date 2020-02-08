import express from 'express';
import bodyParser from 'body-parser';

import CLSContext from 'zipkin-context-cls';
import {Tracer} from 'zipkin';
import {ZipkinRecorder} from './ZipkinRecorder';

const zipkinRecorder = new ZipkinRecorder();
const ctxImpl = new CLSContext();

const localServiceName = 'zipkin-ms-3';
const tracer = new Tracer({ctxImpl, recorder: zipkinRecorder.recorder(localServiceName), localServiceName});

const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(zipkinMiddleware({tracer}));

app.post('/api/v1/callMe', function (req, res) {

    req.body.services.push(localServiceName);
    tracer.recordMessage("Got a request from another service");
    // @ts-ignore
    res.json({"requestDate": req.body.requestDate, "services": req.body.services});

});

app.listen(port, () => {
    console.log(`zipkin-ms-3 listening on port ${port}!`);
});
