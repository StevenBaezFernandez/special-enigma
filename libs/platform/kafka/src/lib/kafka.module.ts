import { Module, DynamicModule, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export interface KafkaModuleOptions {
  clientId: string;
  groupId: string;
  brokers?: string[];
}

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        ClientsModule.register([
          {
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: options.clientId,
                brokers: options.brokers || process.env['KAFKA_BROKERS']?.split(',') || ['localhost:9092'],
              },
              consumer: {
                groupId: options.groupId,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
