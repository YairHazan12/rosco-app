/**
 * Skeleton components for Suspense fallbacks
 * Match the layout shapes of actual components with pulsing animations
 */

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ios-card p-4">
          <div
            className="w-9 h-9 rounded-[10px] mb-3 animate-pulse"
            style={{ background: "var(--separator)" }}
          />
          <div
            className="h-8 w-16 rounded animate-pulse mb-2"
            style={{ background: "var(--separator)" }}
          />
          <div
            className="h-3 w-20 rounded animate-pulse"
            style={{ background: "var(--separator)" }}
          />
        </div>
      ))}
    </div>
  );
}

export function WeekMonthSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2].map((i) => (
        <div key={i} className="ios-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-[8px] animate-pulse"
              style={{ background: "var(--separator)" }}
            />
            <div
              className="h-3 w-20 rounded animate-pulse"
              style={{ background: "var(--separator)" }}
            />
          </div>
          <div
            className="h-7 w-24 rounded animate-pulse mb-2"
            style={{ background: "var(--separator)" }}
          />
          <div
            className="h-3 w-16 rounded animate-pulse mb-4"
            style={{ background: "var(--separator)" }}
          />
          <div
            className="h-12 rounded animate-pulse"
            style={{ background: "var(--separator)", borderTop: "0.5px solid var(--separator)" }}
          />
        </div>
      ))}
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="ios-card p-4">
      <div
        className="h-4 w-28 rounded animate-pulse mb-3"
        style={{ background: "var(--separator)" }}
      />
      <div
        className="h-2.5 rounded-full animate-pulse mb-3"
        style={{ background: "var(--separator)" }}
      />
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-3 w-20 rounded animate-pulse"
            style={{ background: "var(--separator)" }}
          />
        ))}
      </div>
    </div>
  );
}

export function TodayProgressSkeleton() {
  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className="h-4 w-32 rounded animate-pulse"
          style={{ background: "var(--separator)" }}
        />
        <div
          className="h-3 w-16 rounded animate-pulse"
          style={{ background: "var(--separator)" }}
        />
      </div>
      <div
        className="h-2.5 rounded-full animate-pulse mb-2.5"
        style={{ background: "var(--separator)" }}
      />
      <div className="flex gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-3 w-20 rounded animate-pulse"
            style={{ background: "var(--separator)" }}
          />
        ))}
      </div>
    </div>
  );
}

export function JobsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ios-card overflow-hidden">
          <div className="flex">
            <div
              className="w-[3px] flex-shrink-0 animate-pulse"
              style={{ background: "var(--separator)" }}
            />
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="h-3 w-24 rounded animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
                <div
                  className="h-5 w-16 rounded-full animate-pulse"
                  style={{ background: "var(--separator)" }}
                />
              </div>
              <div
                className="h-5 w-3/4 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-3 w-1/2 rounded animate-pulse"
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

export function TeamSkeleton() {
  return (
    <div className="ios-group">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5 min-h-[56px]"
          style={{
            borderBottom: i < 3 ? "0.5px solid var(--separator)" : "none",
          }}
        >
          <div
            className="w-9 h-9 rounded-full animate-pulse flex-shrink-0"
            style={{ background: "var(--separator)" }}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="h-4 w-24 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-3 w-12 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
            </div>
            <div
              className="h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--separator)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InvoicesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="ios-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div
                className="h-5 w-20 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-4 w-32 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
              <div
                className="h-3 w-24 rounded animate-pulse"
                style={{ background: "var(--separator)" }}
              />
            </div>
            <div
              className="h-6 w-16 rounded animate-pulse"
              style={{ background: "var(--separator)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
