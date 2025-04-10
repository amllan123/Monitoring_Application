const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Access the environment variable
const jaegerCollectorUrl = process.env.JAEGER_COLLECTOR_URL || 'http://localhost:14268';

const jaegerExporter = new JaegerExporter({
  endpoint: `${jaegerCollectorUrl}/api/traces`, // Use the environment variable
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  serviceName: "E-commerce Server",
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
