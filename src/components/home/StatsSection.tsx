const stats = [
  { value: "50+", label: "Imprimante Active", mono: true },
  { value: "10K+", label: "Piese Livrate", mono: true },
  { value: "0.05mm", label: "Precizie Minimă", mono: true },
  { value: "24h", label: "Timp Mediu Livrare", mono: true },
];

const StatsSection = () => {
  return (
    <section className="border-y border-border bg-card">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`py-8 md:py-10 px-6 text-center ${
                i < stats.length - 1 ? "border-r border-border" : ""
              }`}
            >
              <p className={`text-2xl md:text-3xl font-bold text-primary mb-1 ${stat.mono ? "font-mono" : ""}`}>
                {stat.value}
              </p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
