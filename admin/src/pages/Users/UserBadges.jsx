import Badge from "../../components/ui/Badge";

export function RoleBadge({ role }) {
  return role === "admin" ? <Badge tone="dark">مدیر</Badge> : <Badge tone="neutral">مشتری</Badge>;
}

export function AccountStatusBadge({ blocked }) {
  return blocked ? <Badge tone="danger">مسدود</Badge> : <Badge tone="success">فعال</Badge>;
}