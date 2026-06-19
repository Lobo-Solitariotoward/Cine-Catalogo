export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return 'Error desconocido'
}

export const parsePositiveInt = (value: unknown, fallback: number): number => {
    const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export const redactSensitive = (value: unknown): unknown => {
    if (!value || typeof value !== 'object') return value

    const sensitiveKeys = new Set(['password', 'password_hash', 'token', 'authorization'])
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
            key,
            sensitiveKeys.has(key.toLowerCase()) ? '[REDACTED]' : entry,
        ])
    )
}
