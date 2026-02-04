import { Module } from '@nestjs/common';
import { CoreModule } from './domains/core/core.module';
import { IamModule } from './domains/iam/iam.module';

@Module({
  imports: [CoreModule, IamModule],
  controllers: [],
  providers: [],
})
export class AppModule {}