import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class DataQualityService {
  async validate(data: any): Promise<boolean> {
    return true;
  }
}

@Module({
  providers: [DataQualityService],
  exports: [DataQualityService],
})
export class DataQualityModule {}
