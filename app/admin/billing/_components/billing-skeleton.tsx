export default function BillingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Stats strip skeleton */}
      <div className="flex gap-3 px-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-[12px] px-4 py-2.5 animate-pulse"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              width: "120px",
              height: "56px",
            }}
          />
        ))}
      </div>

      {/* Filter row skeleton */}
      <div className="flex gap-2 px-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-[100px] animate-pulse"
            style={{ background: "rgba(0,0,0,0.06)", height: "32px", width: `${60 + i * 10}px` }}
          />
        ))}
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mx-5 rounded-[16px] animate-pulse"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            height: "148px",
          }}
        />
      ))}
    </div>
  );
}
