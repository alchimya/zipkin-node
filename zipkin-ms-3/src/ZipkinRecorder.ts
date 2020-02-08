const {
    BatchRecorder,
    jsonEncoder: {JSON_V2}
} = require('zipkin');
import {HttpLogger} from 'zipkin-transport-http';
const debug = 'undefined' !== typeof window
    ? window.location.search.indexOf('debug') !== -1
    : process.env.DEBUG;

const zipkin_Url = "http://zipkin.default.svc.cluster.local";
const zipkin_Port = 9411;
const zipkinBaseUrl = `${zipkin_Url}:${zipkin_Port}`;

const httpLogger = new HttpLogger({
    endpoint: `${zipkinBaseUrl}/api/v2/spans`,
    jsonEncoder: JSON_V2
});

export class ZipkinRecorder {

    recorder(serviceName) {
        return debug ? this.debugRecorder(serviceName) : new BatchRecorder({logger: httpLogger});
    }

    debugRecorder(serviceName) {
        // This is a hack that lets you see the data sent to Zipkin!
        const logger = {
            logSpan: (span) => {
                const json = JSON_V2.encode(span);
                console.log(`${serviceName} reporting: ${json}`);
                httpLogger.logSpan(span);
            }
        };

        const batchRecorder = new BatchRecorder({logger});

        // This is a hack that lets you see which annotations become which spans
        return ({
            record: (rec) => {
                const {spanId, traceId} = rec.traceId;
                console.log(`${serviceName} recording: ${traceId}/${spanId} ${rec.annotation.toString()}`);
                batchRecorder.record(rec);
            }
        });
    }
}
