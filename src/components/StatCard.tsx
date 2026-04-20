type StatCardProps = {
  label: string;
  value: string;
  accent?: "gold" | "teal" | "rose";
};

const accentClass = {
  gold: "from-amber-200 to-orange-100 text-orange-950",
  teal: "from-teal-200 to-cyan-100 text-teal-950",
  rose: "from-rose-200 to-pink-100 text-rose-950",
};

export default function StatCard({ label, value, accent = "gold" }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-sm ${accentClass[accent]}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}
