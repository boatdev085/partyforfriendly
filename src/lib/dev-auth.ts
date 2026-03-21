import { cookies } from 'next/headers'

const DEFAULT_DEV_USER = '6141de95-a2b7-4675-914e-92cdbd734296'

export async function getDevUserId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('dev-user-id')?.value ?? DEFAULT_DEV_USER
}
