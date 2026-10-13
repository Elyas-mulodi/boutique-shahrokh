import Spinner from "./Spinner";

function FullScreenLoader({ text = "در حال بارگذاری..." }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-ink/60">
      <Spinner size={28} className="text-blue" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default FullScreenLoader;