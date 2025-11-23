/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

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
