import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  rating,
  size = 14,
  className,
}: {
  rating: number
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating)
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              filled
                ? 'fill-[oklch(0.78_0.15_85)] text-[oklch(0.78_0.15_85)]'
                : 'fill-muted text-muted-foreground/40',
            )}
          />
        )
      })}
    </div>
  )
}
