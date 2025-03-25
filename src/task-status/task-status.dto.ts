import { TaskStatus } from '../task/task.document'

class TaskStatusInput {
  scanId: string
  apiKey?: string
}

class TaskStatusOutput {
  status: TaskStatus
  updatedAt: string
  result?: Record<string, string>
}

export { TaskStatusInput as TaskStatusInputDto, TaskStatusOutput as TaskStatusOutputDto }
