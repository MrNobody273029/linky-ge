import Image from 'next/image';

export function AppLoader({ label }: { label?: string }) {
  return (
     <div className="fixed inset-0 z-[9999] grid place-items-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Image
            src="/brand/loader-logo.png"
            alt="Loading"
            width={96}
            height={96}
            priority
          />
        </div>

        {/* სურვილისამებრ ტექსტი (თუ არ გინდა, არ მისცე label) */}
        {label ? (
          <div className="text-sm text-white/70">{label}</div>
        ) : null}

        {/* პატარა “დოტები” */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </div>
  );
}
