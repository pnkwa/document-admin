import dayjs, { type ConfigType as DateInput } from 'dayjs'

export const dateFormat = (dateInput?: DateInput, pattern = 'YYYY-MM-DD HH:mm') => {
    return dayjs(dateInput).format(pattern)
}

export const isDateInRange = (
    targetDate: DateInput,
    startDate: DateInput,
    endDate: DateInput,
    unit: dayjs.OpUnitType = 'day',
) => {
    return dayjs(targetDate).isBetween(startDate, endDate, unit, '[]')
}

export const fromNow = (dateInput: DateInput) => {
    return dayjs(dateInput).fromNow()
}

const TOTAL_MINUTES_IN_DAY = 24 * 60

export const displayDate = (date?: string | Date) => {
    if (!date) return '-'

    const now = dayjs()
    const postTime = dayjs(date)

    const diffMinutes = now.diff(postTime, 'minute')

    if (diffMinutes < TOTAL_MINUTES_IN_DAY) {
        return postTime.fromNow()
    }

    return postTime.format('YYYY-MM-DD HH:mm')
}

export const toTimestamp = (date?: string) => {
    return date ? dayjs(date).valueOf() : Number.MIN_SAFE_INTEGER
}
