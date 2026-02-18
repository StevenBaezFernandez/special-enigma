# Virteex Jobs

## Background Worker Service

This application handles heavy background processing tasks for the ERP system.

### Purpose

- **Performance**: Offloads heavy tasks from the API Gateway to ensure responsiveness for users.
- **Scalability**: Can be scaled independently based on job queue volume.

### Responsibilities

- **Accounting Closure**: Processing period-end accounting calculations.
- **PDF Generation**: Mass generation of invoices, reports, and payroll slips.
- **Fiscal Stamping**: Asynchronous processing of fiscal document stamping (timbrado).
- **Event Consumption**: Consumes events from message brokers (RabbitMQ, Kafka, Redis) to trigger jobs.
