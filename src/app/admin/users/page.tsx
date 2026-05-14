import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 mt-1">{users.length} usuários cadastrados</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Usuário</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Função</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Atividade</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Cadastro</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <form action={updateRole}>
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      onChange={(e) => e.target.form?.requestSubmit()}
                      className={`text-sm px-3 py-1.5 rounded-lg border-0 cursor-pointer ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </form>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {user._count.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {user._count.cartItems}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4">
                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      onClick={(e) => {
                        if (!confirm(`Remover usuário "${user.name}"?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}