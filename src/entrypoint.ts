import { NestFactory } from '@nestjs/core'
import { Context, APIGatewayProxyHandlerV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { TaskStatusService } from './task-status/task-status.service'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'
import { ParameterService } from '@shared'
import { HttpStatus, INestApplicationContext, Logger as NestLogger } from '@nestjs/common'
import { TaskStatusInputDto } from './task-status/task-status.dto'
import { ApiKeyNotFoundError, NoAuthorizedApiKeyError, NotFoundError, ScanIdNotFoundError } from './task-status/task-status.error'

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
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        status: output.status,
        updated_at: output.updatedAt
      })
    }
  } catch (error) {
    logger.error(`Error processing task status for scan ID: ${input.scanId}`)
    logger.error(error)
    if (error instanceof ApiKeyNotFoundError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof NoAuthorizedApiKeyError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof ScanIdNotFoundError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof NotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: JSON.stringify({ message: error.message })
      }
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify(error)
    }
  }
}
