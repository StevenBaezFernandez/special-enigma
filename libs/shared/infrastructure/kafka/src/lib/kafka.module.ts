import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'virteex',
            brokers: process.env['KAFKA_BROKERS']?.split(',') || ['localhost:9092'],
          },
          consumer: {
            groupId: 'virteex-consumer', // This should be overridden by consumers
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
