export default function AllJobsSkeleton() {
  return (
    <div className="space-y-6">
      <section>
        <div
          className="h-3 w-24 rounded animate-pulse mb-2.5"
          style={{ background: "var(--separator)" }}
        />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ios-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="h-3 w-28 rounded animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
                <div
                  className="h-5 w-20 rounded-full animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
              </div>
              <div
                className="h-5 w-3/4 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-4 w-1/2 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-3 w-2/3 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-8 rounded animate-pulse"
                style={{
                  background: "var(--separator)",
                  borderTop: "0.5px solid var(--separator)",
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
