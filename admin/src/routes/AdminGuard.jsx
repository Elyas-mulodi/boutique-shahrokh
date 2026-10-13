import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, verifySession } from "../redux/slices/authSlice";
import FullScreenLoader from "../components/ui/FullScreenLoader";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function AdminGuard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, verifyStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && verifyStatus === "idle") dispatch(verifySession());
  }, [token, verifyStatus, dispatch]);

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  if (verifyStatus === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <ErrorState message="ارتباط با سرور برقرار نشد" onRetry={() => dispatch(verifySession())} />
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>
              خروج
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (verifyStatus !== "succeeded") return <FullScreenLoader />;

  return <Outlet />;
}

export default AdminGuard;