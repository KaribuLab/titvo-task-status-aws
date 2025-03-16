import { Module } from '@nestjs/common'
import { TaskStatusService } from './task-status.service'
import { LoggerModule } from 'nestjs-pino'
import { pino } from 'pino'
import { createTaskRepository, TaskRepository } from '../task/task.repository'
import { ParameterService } from '@shared'
@Module({
  imports: [
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
    })
  ],
  providers: [TaskStatusService, {
    provide: TaskRepository,
    useFactory: async (parameterService: ParameterService) => {
      const taskTable = await parameterService.get('dynamo-task-table-name')
      return createTaskRepository({
        tableName: taskTable as string,
        awsStage: process.env.AWS_STAGE ?? 'localstack',
        awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566'
      })
    },
    inject: [ParameterService]
  }]
})
export class TaskStatusModule {}
