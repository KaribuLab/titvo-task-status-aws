import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { TaskDocument, TaskStatus } from './task.document'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class TaskRepository {
  constructor (private readonly dynamoDBClient: DynamoDBClient, private readonly tableName: string) {}

  async putItem (document: TaskDocument): Promise<void> {
    await this.dynamoDBClient.send(new PutItemCommand({
      TableName: this.tableName,
      Item: {
        scan_id: { S: document.scanId },
        status: { S: document.status },
        created_at: { S: document.createdAt },
        updated_at: { S: document.updatedAt }
      }
    }))
  }

  async getItem (scanId: string): Promise<TaskDocument | null> {
    const result = await this.dynamoDBClient.send(new GetItemCommand({
      TableName: this.tableName,
      Key: { scan_id: { S: scanId } }
    }))
    if (result.Item !== undefined) {
      return {
        scanId: result.Item.scan_id.S as string,
        status: result.Item.status.S as TaskStatus,
        createdAt: result.Item.created_at.S as string,
        updatedAt: result.Item.updated_at.S as string,
        result: result.Item.scan_result?.M === undefined ? {} : Object.fromEntries(Object.entries(result.Item.scan_result?.M).map(([key, value]) => [key, value.S as string])) as Record<string, string>
      }
    }
    return null
  }
}

export function createTaskRepository (options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  return new TaskRepository(dynamoDBClient, options.tableName)
}
