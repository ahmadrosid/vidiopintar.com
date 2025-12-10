import { env } from "@/lib/env/server"
import { GoakalWebhookPayload } from "@/types/webhooks-goakal"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const reqBody = (await req.json()) as GoakalWebhookPayload

  // validate token from request same with env GOAKAL_TOKEN
  if (reqBody.token !== env.GOAKAL_TOKEN) {
    throw new Error("Invalid token")
  }

  // const getTransaction = await db.transaction({ where: { paymentID: reqBody.idempotencyKey }})
  // if null save to DB, if exists skip
  if (reqBody.idempotencyKey) {
    // TODO: validate idempotencyKey to DB with transaction table
  }

  // TODO: update transaction to DB

  return new Response("POST Goakal webhook endpoint - ready to receive notifications")
}
