import { useSelector } from "react-redux";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

function DashboardPage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <PageHeader title="داشبورد" description={`خوش آمدید، ${user?.name || ""}`} />
      <Card>
        <p className="text-sm leading-7 text-ink/60">
          ورود موفق بود و ارتباط با سرور برقراره. آمار و نمودارها تو مرحله بعد اینجا اضافه میشن.
        </p>
      </Card>
    </>
  );
}

export default DashboardPage;