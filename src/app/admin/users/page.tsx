import { AutoSubmitSelect, ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { LucideIcon } from "lucide-react";
import { KeyRound, Plus, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/admin");
  }

  logger.dbOperation("operator_list_access", { count: "loading" });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const operatorCount = users.length - adminCount;

  logger.adminAction("operator_list_loaded", { count: users.length });

  async function createUser(formData: FormData) {
    "use server";
    if (!(await ensureAdminAccess("operator_create"))) return;

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "USER");

    if (!name || !email || password.length < 8 || !["USER", "ADMIN"].includes(role)) {
      logger.warn("Blocked invalid operator creation", { email, role });
      return;
    }

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
          role: role as "USER" | "ADMIN",
        },
      });
      logger.adminAction("operator_created_by_admin", { email, role });
      revalidatePath("/admin/users");
    } catch (error) {
      logger.error("Failed to create operator from admin", { email, error: String(error) });
      throw error;
    }
  }

  async function updatePassword(formData: FormData) {
    "use server";
    if (!(await ensureAdminAccess("operator_password_update"))) return;

    const userId = String(formData.get("userId") || "");
    const password = String(formData.get("password") || "");

    if (!userId || password.length < 8) {
      logger.warn("Blocked invalid operator password update", { userId });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(password) },
    });
    logger.adminAction("operator_password_updated", { userId });
    revalidatePath("/admin/users");
  }

  async function updateRole(formData: FormData) {
    "use server";
    if (!(await ensureAdminAccess("operator_role_update"))) return;
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as "USER" | "ADMIN";

    try {
      const oldUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!oldUser) return;

      if (oldUser.role === "ADMIN" && newRole === "USER") {
        const admins = await prisma.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) {
          logger.warn("Blocked last admin demotion", { userId });
          return;
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      logger.adminAction("operator_role_updated", { userId, oldRole: oldUser.role, newRole });
      revalidatePath("/admin/users");
    } catch (error) {
      logger.error("Failed to update operator role", { userId, error: String(error) });
      throw error;
    }
  }

  async function deleteUser(formData: FormData) {
    "use server";
    if (!(await ensureAdminAccess("operator_delete"))) return;
    const userId = formData.get("userId") as string;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      if (user.role === "ADMIN") {
        const admins = await prisma.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) {
          logger.warn("Blocked last admin deletion", { userId });
          return;
        }
      }

      await prisma.favorite.deleteMany({ where: { userId } });
      await prisma.cartItem.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      logger.adminAction("operator_deleted", { userId, userName: user.name, userEmail: user.email });
      revalidatePath("/admin/users");
    } catch (error) {
      logger.error("Failed to delete operator", { userId, error: String(error) });
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <section className="admin-hero-panel rounded-xl p-6 shadow-sm">
        <div className="relative z-[1] flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Seguranca interna</p>
          <h1 className="text-2xl font-black text-slate-950">Operadores do painel</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Controle quem pode operar estoque, leads, FIPE e metricas. Estes acessos sao internos e nao criam conta publica para clientes.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={Users} label="Acessos internos" value={users.length} />
        <SummaryCard icon={ShieldCheck} label="Administradores" value={adminCount} />
        <SummaryCard icon={UserRound} label="Operadores" value={operatorCount} />
      </section>

      <section className="admin-command-bar rounded-xl p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Cadastrar operador</h2>
            <p className="mt-1 text-sm text-slate-500">
              Crie contas internas sem liberar cadastro publico. Use ADMIN apenas para quem pode alterar acessos e operar areas sensiveis.
            </p>
          </div>
        </div>
        <form action={createUser} className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.7fr_auto]">
          <input name="name" required placeholder="Nome do operador" className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <input name="email" type="email" required placeholder="email@limaautomoveis.com.br" className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <input name="password" type="password" required minLength={8} placeholder="Senha inicial" className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <select name="role" defaultValue="USER" className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="USER">Operador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
            <Plus className="h-4 w-4" />
            Criar
          </button>
        </form>
      </section>

      <section className="admin-panel rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-950">Operadores</h2>
            <p className="text-sm text-slate-500">{users.length} registro(s) encontrados</p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <UserRound className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">Nenhum operador cadastrado.</p>
            <p className="mt-1 text-sm">Os acessos internos aparecerao aqui quando forem criados pelo fluxo administrativo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <article key={user.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                    {(user.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{user.name ?? "Sem nome"}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>

                <form action={updateRole}>
                  <input type="hidden" name="userId" value={user.id} />
                  <AutoSubmitSelect
                    name="role"
                    defaultValue={user.role}
                    className={`w-full cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-emerald-500/20 lg:w-auto ${
                      user.role === "ADMIN"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <option value="USER">Operador</option>
                    <option value="ADMIN">Admin</option>
                  </AutoSubmitSelect>
                </form>

                <div className="text-sm text-slate-500">
                  {user.role === "ADMIN" ? "Acesso total ao painel" : "Operacao interna"}
                </div>

                <p className="text-sm text-slate-500">
                  Cadastro em <span className="font-medium text-slate-700">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                </p>

                <form action={deleteUser} className="lg:justify-self-end">
                  <input type="hidden" name="userId" value={user.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message={`Remover operador "${user.name ?? "sem nome"}"?`}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </ConfirmSubmitButton>
                </form>

                <details className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-5">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                    Trocar senha deste acesso
                  </summary>
                  <form action={updatePassword} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      required
                      placeholder="Nova senha com pelo menos 8 caracteres"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <ConfirmSubmitButton
                      type="submit"
                      message={`Trocar a senha de "${user.name ?? "operador"}"?`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <KeyRound className="h-4 w-4" />
                      Atualizar senha
                    </ConfirmSubmitButton>
                  </form>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function ensureAdminAccess(action: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (currentUser?.role === "ADMIN") return true;

  logger.warn("Blocked non-admin access management action", {
    action,
    actorId: currentUser?.id ?? "anonymous",
    actorRole: currentUser?.role ?? "none",
  });
  return false;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="admin-kpi-card rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}
