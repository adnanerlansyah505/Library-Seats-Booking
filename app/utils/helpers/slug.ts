import type { SeoValue } from "@/utils/types/seo"
import type { RouteLocationNormalizedLoaded } from "vue-router"

export const humanizeSlug = (raw: string | string[] | undefined) => {
  if (!raw) return ''
  const slug = Array.isArray(raw) ? raw[0] : raw
  if (!slug) return ''
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || ''
}

// Helper to resolve string | fn
export const resolve = (value: SeoValue | undefined, route: RouteLocationNormalizedLoaded) => {
  if (!value) return ''
  return typeof value === 'function' ? value(route) : value
}