import { Module } from '@nestjs/common'
import { TaskStatusModule } from './task-status/task-status.module'
import { ParameterModule } from '../shared/src/parameter/parameter.module'

@Module({
  imports: [
    TaskStatusModule,
    ParameterModule.forRoot({
      parameterServiceOptions: {
        ttl: 60,
        awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
        awsStage: process.env.AWS_STAGE ?? 'prod',
        parameterBasePath: '/tvo/security-scan',
        serviceName: 'task-status'
      },
      isGlobal: true
    })
  ]
})
export class AppModule {}
