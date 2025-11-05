import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminNavigationProps {
  title: string;
  description: string;
  currentPath?: string;
}

const navigationItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/cost", label: "Cost" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/payment-settings", label: "Payment Settings" },
  { href: "/admin/transactions", label: "Transactions" },
];

export function AdminNavigation({ title, description, currentPath }: AdminNavigationProps) {

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-1 bg-accent rounded-full"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          Admin
        </div>
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-primary">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>

      <div className="flex flex-wrap gap-1 pt-6 px-1 sm:gap-0">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "link", className: "px-2 py-1 text-sm sm:px-0 sm:pr-4 sm:text-base" }),
              currentPath === item.href && "text-primary font-semibold"
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}