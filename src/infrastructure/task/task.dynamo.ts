import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { Logger } from '@nestjs/common'
import { TaskArgs, TaskEntity, TaskRepository, TaskResult, TaskSource, TaskStatus } from '@titvo/trigger'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class DynamoTaskRepository extends TaskRepository {
  private readonly logger = new Logger(DynamoTaskRepository.name)
  private readonly tableName: string
  private readonly dynamoDBClient: DynamoDBClient

  constructor (dynamoDBClient: DynamoDBClient, tableName: string) {
    super()
    this.dynamoDBClient = dynamoDBClient
    this.tableName = tableName
  }

  async save (document: TaskEntity): Promise<void> {
    const marshalledItem = marshall(document)
    await this.dynamoDBClient.send(new PutItemCommand({
      TableName: this.tableName,
      Item: marshalledItem
    }))
  }

  async getById (scanId: string): Promise<TaskEntity | null> {
    const result = await this.dynamoDBClient.send(new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ scan_id: scanId })
    }))
    if (result.Item === undefined) {
      return null
    }
    const unmarshalledItem = unmarshall(result.Item)
    this.logger.debug(`Scan result: ${JSON.stringify(unmarshalledItem.scan_result)}`)
    return {
      id: unmarshalledItem.scan_id,
      source: unmarshalledItem.source as TaskSource,
      repositoryId: unmarshalledItem.repository_id,
      args: unmarshalledItem.args as unknown as TaskArgs,
      result: unmarshalledItem.scan_result as unknown as TaskResult,
      status: unmarshalledItem.status as TaskStatus,
      createdAt: unmarshalledItem.created_at,
      updatedAt: unmarshalledItem.updated_at
    }
  }
}

export function createTaskRepository (options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  return new DynamoTaskRepository(dynamoDBClient, options.tableName)
}
