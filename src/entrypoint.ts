import { NestFactory } from '@nestjs/core'
import { Context, APIGatewayProxyHandlerV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { TaskStatusService } from './task-status/task-status.service'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'
import { ParameterService } from '@titvo/aws'
import { HttpStatus, INestApplicationContext, Logger as NestLogger } from '@nestjs/common'
import { TaskStatusInputDto } from './task-status/task-status.dto'
import { ScanIdNotFoundError, TaskNotFoundError } from './task-status/task-status.error'
import { TaskStatus } from './task/task.document'
import { NoAuthorizedApiKeyError, ApiKeyNotFoundError } from './auth/auth.error'

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
app.get(ParameterService)
const taskStatusService = app.get(TaskStatusService)

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> => {
  const headers = event.headers
  const body = JSON.parse(event.body as string)
  const input: TaskStatusInputDto = {
    scanId: body.scan_id,
    apiKey: headers['x-api-key']
  }
  try {
    logger.log(`Processing task status for scan ID: ${input.scanId}`)
    const output = await taskStatusService.process(input)
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
      body: JSON.stringify({ message: (error as Error).message })
    }
  }
}
