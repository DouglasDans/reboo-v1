"use server"

import { makeLogin } from "@/actions/user.action"
import { createDemoUser } from "@/api/reboo-api/services/user.service"

export async function GET() {
  const createdDemoUser = await createDemoUser()

  return makeLogin({
    email: createdDemoUser.email,
    password: createdDemoUser.password as string,
  })
}
