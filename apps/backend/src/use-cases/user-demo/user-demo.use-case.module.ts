import { Module } from '@nestjs/common'
import { DataServicesModule } from 'src/services/data-services/data-services.module'
import { UserDemoService } from './user-demo.service'
import { UserUseCaseModule } from '../user/user.use-case.module'

@Module({
  imports: [DataServicesModule, UserUseCaseModule],
  providers: [UserDemoService],
  exports: [UserDemoService],
})
export class UserDemoUseCaseModule {}
