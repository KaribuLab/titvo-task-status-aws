import { ActionError } from '../common/common.error'

export class ScanIdNotFoundError extends ActionError {
  constructor (message: string) {
    super('scan-id-not-found', message)
    this.name = 'ScanIdNotFoundError'
  }
}

export class TaskNotFoundError extends ActionError {
  constructor (message: string) {
    super('task-not-found', message)
    this.name = 'TaskNotFoundError'
  }
}
