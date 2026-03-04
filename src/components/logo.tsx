import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-base' },
    md: { icon: 'h-7 w-7', text: 'text-xl' },
    lg: { icon: 'h-10 w-10', text: 'text-2xl' },
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizes[size].icon}
      >
        {/* Rounded square */}
        <rect x="2" y="2" width="28" height="28" rx="8" className="fill-blue-600" />
        {/* "B" letter stylized */}
        <path
          d="M10 8H17C19.2091 8 21 9.79086 21 12C21 13.3062 20.3652 14.4175 19.3913 15.0709C20.8348 15.6156 22 17.0645 22 18.5C22 20.9853 19.9853 23 17.5 23H10V8Z"
          className="fill-white"
        />
        <path
          d="M13.5 10.5V14H16.5C17.6046 14 18.5 13.1046 18.5 12C18.5 10.8954 17.6046 10.5 16.5 10.5H13.5Z"
          className="fill-blue-600"
        />
        <path
          d="M13.5 16.5V20.5H17C18.3807 20.5 19.5 19.3807 19.5 18.5C19.5 17.1193 18.3807 16.5 17 16.5H13.5Z"
          className="fill-blue-600"
        />
      </svg>
      {showText && (
        <span className={cn('font-bold text-gray-900', sizes[size].text)}>
          Bud<span className="text-blue-600">di</span>
        </span>
      )}
    </div>
  )
}
