import { useServiceApi } from '../useServiceApi'

export interface SeatSearchItem {
  id: string
  label: string
  time: string
  date: string | null
  isAvailable: boolean
  type: string
  library: {
    id: number
    slug: string
    name: string
    location: string | null
  }
}

export interface SeatSearchResponse {
  data: SeatSearchItem[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const useSeatSearchService = () => {
  const api = useServiceApi('seats')

  return {
    searchSeats: (params: { q?: string; date?: string; time?: string; seatType?: string; page?: number }) =>
      api.get<SeatSearchResponse>('/search', {
        params,
      }),
  }
}
