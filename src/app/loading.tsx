import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-8">
        <div className="absolute -inset-10 neon-bg opacity-10 blur-[100px] animate-pulse rounded-full" />
        
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin neon-text stroke-[1px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 neon-bg rounded-full animate-ping" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black tracking-[0.4em] neon-text uppercase italic animate-pulse">
            Establishing Connection
          </p>
          <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full neon-bg w-1/3 animate-[shimmer_2s_infinite_linear]" 
                 style={{ width: '40%', animationDuration: '1.5s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}