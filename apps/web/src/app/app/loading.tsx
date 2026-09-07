export default function Loading() {
  return (
    <div role="status" aria-label="Loading workspace">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="loading-grid">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  );
}
