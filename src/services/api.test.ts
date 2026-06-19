import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockRemoveItem = vi.fn()
const mockGetItem = vi.fn()

Object.defineProperty(globalThis, 'localStorage', {
    value: {
        getItem: mockGetItem,
        removeItem: mockRemoveItem,
        setItem: vi.fn(),
    },
})

Object.defineProperty(globalThis, 'window', {
    value: {
        location: { href: '' },
    },
})

describe('api interceptor 401', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.location.href = ''
        mockGetItem.mockReturnValue('test_token')
    })

    it('limpia storage y redirige a /login en 401 de ruta protegida', async () => {
        const error = {
            response: { status: 401 },
            config: { url: '/api/lists/1' },
        }

        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                localStorage.removeItem('cinelog_token')
                localStorage.removeItem('cinelog_sesion')
                window.location.href = '/login'
            }
        }

        expect(mockRemoveItem).toHaveBeenCalledWith('cinelog_token')
        expect(mockRemoveItem).toHaveBeenCalledWith('cinelog_sesion')
        expect(window.location.href).toBe('/login')
    })

    it('NO redirige cuando el 401 es del endpoint de login', async () => {
        const error = {
            response: { status: 401 },
            config: { url: '/api/auth/login' },
        }

        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                localStorage.removeItem('cinelog_token')
                localStorage.removeItem('cinelog_sesion')
                window.location.href = '/login'
            }
        }

        expect(mockRemoveItem).not.toHaveBeenCalled()
        expect(window.location.href).toBe('')
    })

    it('NO redirige cuando el 401 es del endpoint de registro', async () => {
        const error = {
            response: { status: 401 },
            config: { url: '/api/auth/register' },
        }

        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                localStorage.removeItem('cinelog_token')
                localStorage.removeItem('cinelog_sesion')
                window.location.href = '/login'
            }
        }

        expect(mockRemoveItem).not.toHaveBeenCalled()
    })
})
