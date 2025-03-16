export class ActionError extends Error {
  constructor (action: string, message: string) {
    super(`${action} failed: ${message}`)
  }
}

export class ApiKeyNotFoundError extends ActionError {
  constructor (message: string) {
    super('api-key-not-found', message)
    this.name = 'ApiKeyNotFoundError'
  }
}

export class NoAuthorizedApiKeyError extends ActionError {
  constructor (message: string) {
    super('no-authorized-api-key', message)
    this.name = 'NoAuthorizedApiKeyError'
  }
}

export class NotFoundError extends ActionError {
  constructor (message: string) {
    super('dynamo-get-item', message)
    this.name = 'NotFoundError'
  }
}

export class ScanIdNotFoundError extends ActionError {
  constructor (message: string) {
    super('scan-id-not-found', message)
    this.name = 'ScanIdNotFoundError'
  }
}
