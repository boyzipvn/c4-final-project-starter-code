import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodos as getTodos } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todos = await getTodos(event)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
