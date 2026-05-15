import { AutoSubmitSelect, ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
  logger.dbOperation("user_list_access", { count: "loading" });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true, cartItems: true } },
    },
  });

  logger.adminAction("user_list_loaded", { count: users.length });

  async function updateRole(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as "USER" | "ADMIN";

    try {
      const oldUser = await prisma.user.findUnique({ where: { id: userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      logger.adminAction("user_role_updated", { userId, oldRole: oldUser?.role, newRole });
      revalidatePath("/admin/users");
    } catch (error) {
      logger.error("Failed to update user role", { userId, error: String(error) });
      throw error;
    }
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await prisma.favorite.deleteMany({ where: { userId } });
      await prisma.cartItem.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      logger.adminAction("user_deleted", { userId, userName: user?.name, userEmail: user?.email });
      revalidatePath("/admin/users");
    } catch (error) {
      logger.error("Failed to delete user", { userId, error: String(error) });
      throw error;
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-gray-500">{users.length} usuários cadastrados</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Usuário</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Função</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Atividade</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Cadastro</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        {(user.name ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{user.name ?? "Sem nome"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <form action={updateRole}>
                    <input type="hidden" name="userId" value={user.id} />
                    <AutoSubmitSelect
                      name="role"
                      defaultValue={user.role}
                      className={`cursor-pointer rounded-lg border-0 px-3 py-1.5 text-sm ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 font-medium text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                    </AutoSubmitSelect>
                  </form>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {user._count.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {user._count.cartItems}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4">
                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <ConfirmSubmitButton
                      type="submit"
                      message={`Remover usuário "${user.name ?? "sem nome"}"?`}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">Nenhum usuário cadastrado ainda.</p>
            <p className="text-sm mt-1">Os usuários aparecerão aqui quando se registrarem.</p>
          </div>
        )}
      </div>
    </div>
  );
}
