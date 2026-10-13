import { Clock } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

function ComingSoonPage({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <Card padding="p-0">
        <EmptyState icon={Clock} title="این بخش در مراحل بعد ساخته می‌شود" />
      </Card>
    </>
  );
}

export default ComingSoonPage;