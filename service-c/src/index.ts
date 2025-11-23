
// import { trace, SpanKind, propagation, context } from "@opentelemetry/api";
// import { NodeSDK } from "@opentelemetry/sdk-node";
// import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
// import { resourceFromAttributes } from '@opentelemetry/resources';
// import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// // Start OpenTelemetry SDK before anything else so auto-instrumentation can hook into libs
// const sdk = new NodeSDK({
//     resource: resourceFromAttributes({
//         [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "service-a",
//         [ATTR_SERVICE_VERSION]: '1.0',
//     }),
//     instrumentations: [getNodeAutoInstrumentations()],
//     // NodeSDK accepts traceExporter; it will wire a BatchSpanProcessor internally.
// });

// sdk.start()

import express from "express";

async function start(): Promise<void> {

    const app = express();
    const port = Number(process.env.PORT || 3000);

    app.use(express.json());

    // Simple endpoint which also creates a manual span to show custom attributes/events
    app.get("/hello", async (req, res) => {
        // const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME || "service-a");

        // await tracer.startActiveSpan("handler.hello", { kind: SpanKind.SERVER }, async (span) => {
        //     try {
        // span.setAttribute("http.route", "/hello");
        // span.addEvent("handling request");
        // Simulate some work or business logic
        const output: Record<string, string> = {};
        // propagation.inject(context.active(), output);
        const response = await fetch("http://ts-service-b:3000/hello", {
            headers: { 'Content-Type': 'application/json', 'tp': output['traceparent'], 'ts': output['tracestate'] }
        })
        const data = await response.json();
        res.json(data);
        console.log("Fetched from service-b:", data);


        //     } catch (err) {
        //         span.recordException(err as Error);
        //         res.status(500).json({ error: "internal" });
        //     } finally {
        //         span.end();
        //     }
        // });
    });

    app.use("/app", express.static("public"));

    app.listen(port, (err) => {
        if (err) {
            console.error("Failed to start server", err);
            process.exit(1);
        }
        console.log(`service-c listening on http://localhost:${port}`);
    });

    // Graceful shutdown: ensure OpenTelemetry SDK flushes spans
    const shutdown = async () => {
        console.log("shutting down...");
        try {
            //await sdk.shutdown();
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
    // sdk.shutdown().finally(() => process.exit(1));
});
