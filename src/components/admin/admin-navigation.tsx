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
  { href: "/admin/sponsor-deals", label: "Sponsor Deals" },
  { href: "/admin/payment-settings", label: "Payment Settings" },
  { href: "/admin/transactions", label: "Transactions" },
];

export function AdminNavigation({ title, description, currentPath }: AdminNavigationProps) {

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>

      <div className="flex flex-wrap gap-1 pt-4 px-1 sm:gap-0">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "link", className: "px-2 py-1 text-sm sm:px-0 sm:pr-4 sm:text-base" }),
              currentPath === item.href && "text-primary"
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}