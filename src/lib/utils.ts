import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get favicon for a website
export function getFavicon(url: string): string {
  try {
    const parsedUrl = new URL(url)

    // Try different possible favicon locations
    const possibleFavicons = [
      // Standard favicon.ico at the root
      `${parsedUrl.origin}/favicon.ico`,

      // Google's favicon service (will use this as fallback)
      `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`,

      // DuckDuckGo's favicon service (alternative)
      `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname}.ico`,
    ]

    // Return the first option - if it fails, the image's onError will handle fallbacks
    return possibleFavicons[0]
  } catch (error) {
    // Return a default favicon for special pages or invalid URLs
    return "/favicon.ico"
  }
}

// Check if a URL is valid
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString)
    return true
  } catch (error) {
    return false
  }
}

// Extract domain from URL
export function getDomain(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname.replace(/^www\./, '')
  } catch (error) {
    return url
  }
}

// Format a date for display
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }
}
