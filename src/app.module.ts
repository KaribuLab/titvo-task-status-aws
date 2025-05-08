import { Module } from '@nestjs/common'
import { TaskModule } from '@infrastructure/task/task.module'
import { ConfigModule } from '@titvo/aws'
import { LoggerModule } from 'nestjs-pino'
import { pino } from 'pino'
@Module({
  imports: [
    TaskModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level (label: string): { level: string } {
            return { level: label }
          }
        }
      }
    }),
    ConfigModule.forRoot({
      configOptions: {
        awsStage: process.env.AWS_STAGE ?? 'prod',
        awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
        tableName: process.env.CONFIG_TABLE_NAME as string
      }
    })
  ]
})
export class AppModule {}
