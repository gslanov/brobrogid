import { cn } from '@/shared/lib/utils'

interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 py-1.5 text-white text-xs font-medium">
      <span>9:41</span>
      <div className="absolute left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-b-2xl" />
      <div className="flex items-center gap-1.5">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="5" width="3" height="7" rx="0.5" fill="white" />
          <rect x="4.5" y="3.5" width="3" height="8.5" rx="0.5" fill="white" />
          <rect x="9" y="1.5" width="3" height="10.5" rx="0.5" fill="white" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="white" opacity="0.35" />
        </svg>
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <path d="M7.5 3.5C9.5 3.5 11.2 4.3 12.5 5.5L13.8 4.2C12.1 2.6 10 1.5 7.5 1.5C5 1.5 2.9 2.6 1.2 4.2L2.5 5.5C3.8 4.3 5.5 3.5 7.5 3.5Z" fill="white" />
          <path d="M7.5 6.5C8.8 6.5 10 7 10.8 7.8L12 6.5C10.8 5.4 9.2 4.7 7.5 4.7C5.8 4.7 4.2 5.4 3 6.5L4.2 7.8C5 7 6.2 6.5 7.5 6.5Z" fill="white" />
          <circle cx="7.5" cy="10.5" r="1.5" fill="white" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0" y="1" width="21" height="10" rx="2" stroke="white" strokeOpacity="0.4" />
          <rect x="1.5" y="2.5" width="15" height="7" rx="1" fill="white" />
          <rect x="22" y="4" width="2" height="4" rx="0.5" fill="white" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="flex justify-center pb-2 pt-1">
      <div className="w-[134px] h-[5px] rounded-full bg-black/80" />
    </div>
  )
}

export default function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div
        className="relative flex flex-col rounded-[40px] bg-[#1a1a1a] shadow-xl shadow-black/25"
        style={{ width: 375 + 24, height: 812 + 24 }}
      >
        <div className="absolute inset-[12px] flex flex-col rounded-[32px] overflow-hidden bg-white">
          <div className="shrink-0 bg-black relative">
            <StatusBar />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          <div className="shrink-0 bg-white">
            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  )
}
