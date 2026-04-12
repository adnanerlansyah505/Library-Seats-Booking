import { useServiceApi } from '../useServiceApi'

export interface Reminder {
	id: number
	reservationId: number
	channel: 'email' | 'push'
	status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
	sendAt: string
	sentAt: string | null
	errorMessage: string | null
}

export const useReminderService = () => {
	const api = useServiceApi('reminders')

	return {
		createReminder: (reservationId: number, offsetMinutes = 15) =>
			api.post<{ data: Reminder }>('/', {
				body: { reservationId, offsetMinutes },
			}),
	}
}
