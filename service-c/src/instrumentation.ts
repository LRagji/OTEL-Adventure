/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
// process.env.OTEL_LOG_LEVEL = 'debug';
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
process.env.OTEL_TRACES_EXPORTER = 'otlp';
process.env.OTEL_METRICS_EXPORTER = 'otlp';
process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/json';
process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS = 'http,express,undici,grpc';
// process.env.OTEL_SERVICE_NAME = 'service-a';
process.env.PORT = '3001';

// # open telemetry config
// OTEL_ENABLED=true
// OTEL_COLLECTOR_ENABLED=true
// OTEL_DEBUG=false
// OTEL_LOG_LEVEL='info'
// OTEL_EXPORTER_OTLP_ENDPOINT='http://127.0.0.1:4317'
// OTEL_EXPORTER_OTLP_INSECURE=true
// OTEL_METRIC_EXPORT_INTERVAL=60000
// OTEL_NODE_EXCLUDED_URLS='metrics,health'
// OTEL_TRACES_SAMPLER='traceidratio'
// OTEL_TRACES_SAMPLER_ARG=1.0


import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "service-X",
        [ATTR_SERVICE_VERSION]: '1.0',
    }),
    // traceExporter: new ConsoleSpanExporter(),
    // metricReader: new PeriodicExportingMetricReader({
    //     exporter: new ConsoleMetricExporter(),
    // }),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
