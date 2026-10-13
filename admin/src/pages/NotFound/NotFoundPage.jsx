import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";

function NotFoundPage() {
  return (
    <Card className="mx-auto mt-10 max-w-md py-12 text-center">
      <p className="font-heading text-6xl font-bold text-ink/10">۴۰۴</p>
      <h1 className="mt-3 font-heading text-lg font-bold text-ink">صفحه پیدا نشد</h1>
      <p className="mt-1 text-sm text-ink/50">آدرس واردشده وجود ندارد.</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-blue"
      >
        بازگشت به داشبورد
      </Link>
    </Card>
  );
}

export default NotFoundPage;