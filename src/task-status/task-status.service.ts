import { Injectable } from '@nestjs/common'
import { TaskStatusInputDto, TaskStatusOutputDto } from './task-status.dto'
import { TaskRepository } from '../task/task.repository'
import { ScanIdNotFoundError, TaskNotFoundError } from './task-status.error'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class TaskStatusService {
  constructor (private readonly taskRepository: TaskRepository, private readonly authService: AuthService) {}
  async process (input: TaskStatusInputDto): Promise<TaskStatusOutputDto> {
    await this.authService.validateApiKey(input.apiKey)
    if (input.scanId === undefined) {
      throw new ScanIdNotFoundError('Scan ID not found')
    }
    const document = await this.taskRepository.getItem(input.scanId)
    if (document === null) {
      throw new TaskNotFoundError('Task not found')
    }
    return {
      status: document.status,
      updatedAt: document.updatedAt,
      result: document.result
    }
  }
}
