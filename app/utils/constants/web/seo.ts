import type { SeoConfig } from "~/utils/types/seo.types";
import { humanizeSlug } from "~/utils/helpers/slug";

export const defaultSeo: SeoConfig = {
    title: 'Library Booking App',
    description: 'Library Booking App — manage your bookings and schedules.',
    image: '/favicon.ico',
}

export const pageSeo: Record<string, SeoConfig> = {
    index: {
        headerTitle: "Library Seat Booking",
        title: "Home - Library Booking App",
        description: "Quickly book and manage your library seat"
    },
    profile: {
        headerTitle: "Profile",
        title: "Profile - Library Booking App",
        description: "Manage your profile and account settings"
    },
    // bookings: {
    //     headerTitle: "Bookings",
    //     title: "Bookings - Library Booking App",
    //     description: "View and schedule your library seat bookings"
    // },
    search: {
        headerTitle: "Search Libraries",
        title: "Search - Library Booking App",
        description: "Search for available library seats"
    },
    'my-bookings': {
        headerTitle: "My Bookings",
        title: "My Bookings - Library Booking App",
        description: "View and manage your library seat bookings"
    },
    faqs: {
        headerTitle: "Help & Support",
        title: "FAQs - Library Booking App",
        description: "Find answers to common questions about the Library Booking App"
    },
    'bookings-bookingSlug': {
        headerTitle: (route: any) => {
            return humanizeSlug(route.params.bookingSlug)
        },
        title: (route: any) => `${humanizeSlug(route.params.bookingSlug)} - Library Booking App`,
        description: (route: any) => `Details and management for your booking: ${humanizeSlug(route.params.slug)}`
    },
    'bookings-bookingSlug-seats-seatSlug': {
        headerTitle: (route) => {
            const library = humanizeSlug(route.params.bookingSlug)
            // second [slug] param is likely named `slug_1` – if you renamed it, swap this
            const seat = humanizeSlug(route.params.seatSlug)
            return `${library} - ${seat}` // e.g. "Modern Library - Seat 1"
        },
        title: (route) => {
            const library = humanizeSlug(route.params.bookingSlug)
            const seat = humanizeSlug(route.params.seatSlug)
            return `${library} - ${seat} Library Booking App`
        },
        description: (route) => {
            const library = humanizeSlug(route.params.bookingSlug)
            const seat = humanizeSlug(route.params.seatSlug)
            return `Book ${seat} at ${library}.`
        },
    }
}

