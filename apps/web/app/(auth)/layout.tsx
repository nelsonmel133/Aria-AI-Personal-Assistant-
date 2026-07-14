export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-bg text-xl font-bold font-display">A</span>
          </div>
          <h1 className="font-display text-2xl text-text-primary">Aria</h1>
          <p className="text-sm text-text-muted mt-1">Your calm, capable assistant</p>
        </div>
        {children}
      </div>
    </div>
  );
}
