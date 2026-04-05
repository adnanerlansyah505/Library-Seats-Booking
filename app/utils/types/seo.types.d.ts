import type { RouteLocationNormalizedLoaded } from 'vue-router'

export type SeoValue = string | ((route: RouteLocationNormalizedLoaded) => string)

export type SeoConfig = {
    headerTitle?: SeoValue
    title: SeoValue
    description: SeoValue
    image?: string
    url?: string
    showBack?: boolean
}