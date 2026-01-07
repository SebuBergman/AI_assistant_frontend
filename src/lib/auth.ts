// lib/auth.ts
export function getUserId(): string {
  const userId = process.env.NEXT_PUBLIC_USER_ID || process.env.USER_ID;
  
  if (!userId) {
    throw new Error('User ID not found in environment variables');
  }
  
  return userId;
}