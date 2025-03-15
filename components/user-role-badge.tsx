import { Badge } from "@/components/ui/badge"

interface UserRoleBadgeProps {
  role: "admin" | "employee"
  className?: string
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"} className={className}>
      {role === "admin" ? "Administrador" : "Empleado"}
    </Badge>
  )
}

