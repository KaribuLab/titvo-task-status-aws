import { NestFactory } from '@nestjs/core'
import { Context, APIGatewayProxyHandlerV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'
import { HttpStatus, INestApplicationContext, Logger as NestLogger } from '@nestjs/common'
import { TaskStatus } from '@trigger/core/task/task.entity'
import { GetTaskStatusUseCase, GetTaskStatusInputDto, TaskNotFoundError, ScanIdNotFoundError } from '@titvo/trigger'
import { NoAuthorizedApiKeyError, ApiKeyNotFoundError } from '@titvo/auth'
const logger = new NestLogger('TaskStatusHandler')

async function initApp (): Promise<INestApplicationContext> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true
  })
  await app.init()
  app.useLogger(app.get(Logger))
  app.flushLogs()
  return app
}

const app = await initApp()
const getTaskStatusUseCase = app.get(GetTaskStatusUseCase)

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> => {
  const headers = event.headers
  const body = JSON.parse(event.body as string)
  const input: GetTaskStatusInputDto = {
    scanId: body.scan_id,
    apiKey: headers['x-api-key']
  }
  try {
    logger.log(`Processing task status for scan ID: ${input.scanId}`)
    const output = await getTaskStatusUseCase.execute(input)
    const responseBody: {
      status: TaskStatus
      updated_at: string
      result?: Record<string, string>
    } = {
      status: output.status,
      updated_at: output.updatedAt
    }
    if (output.result !== undefined) {
      responseBody.result = output.result
    }
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: HttpStatus.OK,
      body: JSON.stringify(responseBody)
    }
  } catch (error) {
    logger.error(`Error processing task status for scan ID: ${input.scanId}`)
    logger.error(error)
    if (error instanceof ApiKeyNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof NoAuthorizedApiKeyError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof ScanIdNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof TaskNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.NOT_FOUND,
        body: JSON.stringify({ message: error.message })
      }
    }
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: process.env.LOG_LEVEL === 'debug' ? (error as Error).message : 'Internal server error' })
    }
  }
}
