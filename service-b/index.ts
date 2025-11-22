
import { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanKind, propagation, context, type Context } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
// Start OpenTelemetry SDK before anything else so auto-instrumentation can hook into libs
const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "service-b",
        [ATTR_SERVICE_VERSION]: '1.0',
    }),
    instrumentations: [],
    // NodeSDK accepts traceExporter; it will wire a BatchSpanProcessor internally.
});
sdk.start();

import express from "express";
// import { ConsoleSpanExporter, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
// import { Resource } from "@opentelemetry/resources";
// import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
// import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// /C:/Users/wpred/Documents/git/scratch-pad/service-a/index.ts
//
// Required packages (install before running):
// npm install express @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/sdk-trace-base @opentelemetry/resources @opentelemetry/semantic-conventions
//
// This file initializes OpenTelemetry tracing and starts a minimal Express server
// with one endpoint. Spans are exported to the console via ConsoleSpanExporter.


// Enable basic OTEL diagnostics to the console (useful during development)
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Name the service for traces


// Create an SDK instance with auto-instrumentations and a console exporter.
// In production you would replace the ConsoleSpanExporter with OTLP/Jaeger exporter.

async function start(): Promise<void> {


    const app = express();
    const port = Number(process.env.PORT || 3000);

    // Simple endpoint which also creates a manual span to show custom attributes/events
    app.get("/hello", (req, res) => {
        const input: Record<string, string> = {};
        input['traceparent'] = req.headers['tp'] as string || '';
        input['tracestate'] = req.headers['ts'] as string || '';
        let activeContext: Context = propagation.extract(context.active(), input);
        const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME || "service-b");
        tracer.startActiveSpan("handler.hello", { kind: SpanKind.SERVER }, activeContext, async (span) => {
            try {
                span.setAttribute("http.route", "/hello");
                span.addEvent("handling request");

                // Simulate some work or business logic
                res.json({ message: "Hello from service-b", time: new Date().toISOString() });
            } catch (err) {
                span.recordException(err as Error);
                res.status(500).json({ error: "internal" });
            } finally {
                span.end();
            }
        });
    });

    app.listen(port, () => {
        console.log(`service-b listening on http://localhost:${port}`);
    });

    // Graceful shutdown: ensure OpenTelemetry SDK flushes spans
    const shutdown = async () => {
        console.log("shutting down...");
        try {
            await sdk.shutdown();
            console.log("OpenTelemetry SDK shut down cleanly");
        } catch (err) {
            console.error("Error shutting down OpenTelemetry SDK", err);
        } finally {
            process.exit(0);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start().catch((err) => {
    console.error("Failed to start application", err);
    // ensure sdk is shutdown on start failure
    sdk.shutdown().finally(() => process.exit(1));
});