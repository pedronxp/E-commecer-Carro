import { unauthorizedError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorizedError("Não autenticado.", request);
  }

  return Response.json({ user });
}
