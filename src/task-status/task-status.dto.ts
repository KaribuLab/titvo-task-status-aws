import { TaskStatus } from '../task/task.document'

class TaskStatusInput {
  scanId: string
  apiKey?: string
}

class TaskStatusOutput {
  status: TaskStatus
  updatedAt: string
  issueUrl?: string
}

export { TaskStatusInput as TaskStatusInputDto, TaskStatusOutput as TaskStatusOutputDto }
