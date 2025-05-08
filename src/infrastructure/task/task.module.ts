import { Module } from '@nestjs/common'
import { createTaskRepository } from '@infrastructure/task/task.dynamo'
import { TaskRepository, GetTaskStatusUseCase } from '@titvo/trigger'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { ApiKeyModule } from '@infrastructure/api-key/api-key.module'
@Module({
  providers: [
    ValidateApiKeyUseCase,
    GetTaskStatusUseCase,
    {
      provide: TaskRepository,
      useFactory: () => createTaskRepository({
        tableName: process.env.TASK_TABLE_NAME as string,
        awsStage: process.env.AWS_STAGE as string,
        awsEndpoint: process.env.AWS_ENDPOINT as string
      })
    }],
  imports: [ApiKeyModule],
  exports: [GetTaskStatusUseCase]
})
export class TaskModule {}
