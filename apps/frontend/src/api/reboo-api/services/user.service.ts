"use server"

import api from "../api.config"
import { User } from "../api.types"

export async function getUserById(id: number): Promise<User> {
  return await api.get(`/user/${id}`)
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ access_token: string; userId: number }> {
  return await api.post("auth", {
    email,
    password,
  })
}

export async function createDemoUser(): Promise<User> {
  return await api.post("user/demo")
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  return await api.post("user", data)
}
