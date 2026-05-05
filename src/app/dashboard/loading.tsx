export default function Loading() {
  return (
    <div className="min-h-screen bg-beige/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Se încarcă...</p>
      </div>
    </div>
  );
}
