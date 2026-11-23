const ADMIN_TIMEOUT_MS = 22_000;

export async function withAdminTimeout<T>(
  work: Promise<T>,
  message = "کات تەواو بوو — دووبارە هەوڵبدەرەوە",
): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ADMIN_TIMEOUT_MS);
    }),
  ]);
}