import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskStatusInputDto, TaskStatusOutputDto } from './task-status.dto'
import { ParameterService } from '@shared'
import { TaskRepository } from '../task/task.repository'
import { NoAuthorizedApiKeyError, ApiKeyNotFoundError, ScanIdNotFoundError } from './task-status.error'

@Injectable()
export class TaskStatusService {
  constructor (private readonly parameterService: ParameterService, private readonly taskRepository: TaskRepository) {}
  async process (input: TaskStatusInputDto): Promise<TaskStatusOutputDto> {
    const apiKey = await this.parameterService.get<string>('api-key')
    if (apiKey === undefined) {
      throw new ApiKeyNotFoundError('API key not found')
    }
    if (apiKey !== input.apiKey) {
      // FIXME: Use table for authorized API keys
      throw new NoAuthorizedApiKeyError('Invalid API key')
    }
    if (input.scanId === undefined) {
      throw new ScanIdNotFoundError('Scan ID not found')
    }
    const document = await this.taskRepository.getItem(input.scanId)
    if (document === null) {
      throw new NotFoundException('Task not found')
    }
    return {
      status: document.status,
      updatedAt: document.updatedAt,
      issueUrl: document.issueUrl
    }
  }
}
