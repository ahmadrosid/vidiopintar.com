import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env/server";
import { redirect } from "next/navigation";

export function isUserAdmin(user: any): boolean {
    return user.email === env.ADMIN_MASTER_EMAIL;
}

export async function getCurrentUserWithAdminCheck() {
    const user = await getCurrentUser();
    return {
        ...user,
        isAdmin: isUserAdmin(user)
    };
}

export async function requireAdmin() {
    const user = await getCurrentUserWithAdminCheck();

    if (!user.isAdmin) {
        redirect("/home");
    }

    return user;
}
