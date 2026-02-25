export default function InvoicesListSkeleton() {
  return (
    <>
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="ios-card p-4">
            <div
              className="w-8 h-8 rounded-[9px] animate-pulse mb-2"
              style={{ background: "var(--separator)" }}
            />
            <div
              className="h-8 w-24 rounded animate-pulse mb-1"
              style={{ background: "var(--separator)" }}
            />
            <div
              className="h-3 w-20 rounded animate-pulse"
              style={{ background: "var(--separator)" }}
            />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="ios-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-20 rounded-full animate-pulse"
                    style={{ background: "var(--separator)" }}
                  />
                  <div
                    className="h-3 w-16 rounded animate-pulse"
                    style={{ background: "var(--separator)" }}
                  />
                </div>
                <div
                  className="h-5 w-32 rounded animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
                <div
                  className="h-3 w-40 rounded animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
                <div
                  className="h-3 w-24 rounded animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
              </div>
              <div
                className="h-7 w-20 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
