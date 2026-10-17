import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
      <ArrowRight size={16} />
      {children}
    </Link>
  );
}

export default BackLink;