"use server"

import { redirect } from "next/navigation"
import { createUser, authenticateUser } from "@/lib/auth"
import { createSession, deleteSession } from "@/lib/session"

export async function signUp(email: string, password: string, name: string) {
  try {
    const existingUser = await createUser(email, password, name)

    if (!existingUser) {
      return { error: "Failed to create user" }
    }

    await createSession({
      userId: existingUser.id,
      email: existingUser.email,
    })

    redirect("/dashboard")
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Email already exists" }
    }
    return { error: "An error occurred during sign up" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const user = await authenticateUser(email, password)

    if (!user) {
      return { error: "Invalid email or password" }
    }

    await createSession({
      userId: user.id,
      email: user.email,
    })

    redirect("/dashboard")
  } catch (error) {
    return { error: "An error occurred during sign in" }
  }
}

export async function signOut() {
  await deleteSession()
  redirect("/")
}
