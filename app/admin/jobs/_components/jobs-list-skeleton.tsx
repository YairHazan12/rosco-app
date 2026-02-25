export default function JobsListSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="ios-card overflow-hidden">
          <div className="flex">
            <div
              className="w-[3px] flex-shrink-0 animate-pulse"
              style={{ background: "var(--separator)" }}
            />
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="h-5 w-20 rounded-full animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
                <div
                  className="h-3 w-28 rounded animate-pulse"
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
          </div>
        </div>
      ))}
    </div>
  );
}
