import { expect, test } from '@playwright/test'

const seedSession = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cinelog_sesion',
      JSON.stringify({ id: 1, nombre: 'QA User', email: 'qa@cinelog.test', avatar: '', rol: 'user' })
    )
    localStorage.setItem('cinelog_token', 'token-e2e')
  })
}

const seedAdminSession = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cinelog_sesion',
      JSON.stringify({ id: 2, nombre: 'Admin User', email: 'admin@cinelog.test', avatar: '', rol: 'admin' })
    )
    localStorage.setItem('cinelog_token', 'token-admin-e2e')
  })
}

const mockLoginSuccess = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'token-e2e',
        usuario: { id: 1, nombre: 'QA User', email: 'qa@cinelog.test', rol: 'user' },
      }),
    })
  })
}

const mockLoginInvalid = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Credenciales invalidas' }),
    })
  })
}

const mockSearchResults = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/movies/search**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resultados: [
          { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'N/A' },
          { imdbID: 'tt0137523', Title: 'Fight Club', Year: '1999', Type: 'movie', Poster: 'N/A' },
        ],
      }),
    })
  })
}

// ── AUTH ──

test.describe('Autenticacion', () => {
  test('ruta protegida redirige visitantes a login', async ({ page }) => {
    await page.goto('/inicio')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('login muestra validacion con aria-live', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toContainText('completa')
  })

  test('login exitoso navega al inicio', async ({ page }) => {
    await mockLoginSuccess(page)
    await page.goto('/login')
    await page.getByTestId('login-email').fill('qa@cinelog.test')
    await page.getByTestId('login-password').fill('Test1234')
    await page.getByTestId('login-submit').click()
    await expect(page).toHaveURL(/\/inicio$/)
  })

  test('login con credenciales invalidas muestra error', async ({ page }) => {
    await mockLoginInvalid(page)
    await page.goto('/login')
    await page.getByTestId('login-email').fill('wrong@test.com')
    await page.getByTestId('login-password').fill('wrongpass')
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
  })

  test('logout limpia sesion y redirige a login', async ({ page }) => {
    await seedSession(page)
    await page.goto('/perfil')
    await page.getByRole('button', { name: /cerrar/i }).click()
    await expect(page).toHaveURL(/\/login$/)
  })
})

// ── REGISTRO ──

test.describe('Registro', () => {
  test('registro valida password debil y expone error accesible', async ({ page }) => {
    await page.goto('/registro')
    await page.getByTestId('registro-nombre').fill('QA User')
    await page.getByTestId('registro-email').fill('qa@cinelog.test')
    await page.getByTestId('registro-password').fill('weak')
    await page.getByTestId('registro-confirmar').fill('weak')
    await page.getByTestId('registro-submit').click()
    await expect(page.getByTestId('registro-error')).toContainText('contraseña')
  })

  test('registro exitoso navega al inicio', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-e2e',
          usuario: { id: 1, nombre: 'QA User', email: 'qa@cinelog.test', rol: 'user' },
        }),
      })
    })

    await page.goto('/registro')
    await page.getByTestId('registro-nombre').fill('QA User')
    await page.getByTestId('registro-email').fill('qa@cinelog.test')
    await page.getByTestId('registro-password').fill('Test1234')
    await page.getByTestId('registro-confirmar').fill('Test1234')
    await page.getByTestId('registro-submit').click()
    await expect(page).toHaveURL(/\/inicio$/)
  })
})

// ── BUSQUEDA ──

test.describe('Busqueda', () => {
  test('buscar muestra resultados', async ({ page }) => {
    await seedSession(page)
    await mockSearchResults(page)
    await page.goto('/buscar')
    await page.getByTestId('buscar-input').fill('Inception')
    await expect(page.getByText('Inception')).toBeVisible()
  })

  test('buscar error de servidor muestra mensaje de error', async ({ page }) => {
    await seedSession(page)
    await page.route('**/api/movies/search**', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'fallo' }) })
    })
    await page.goto('/buscar')
    await page.getByTestId('buscar-input').fill('server-error')
    await expect(page.getByText(/Error al buscar|fallo/i)).toBeVisible()
  })

  test('limpiar busqueda borra el input', async ({ page }) => {
    await seedSession(page)
    await mockSearchResults(page)
    await page.goto('/buscar')
    await page.getByTestId('buscar-input').fill('Inception')
    await expect(page.getByTestId('buscar-input')).toHaveValue('Inception')
    await page.getByRole('button', { name: /limpiar/i }).click()
    await expect(page.getByTestId('buscar-input')).toHaveValue('')
  })
})

// ── RECUPERAR CONTRASENA ──

test.describe('Recuperar Contrasena', () => {
  test('navegar a recuperar contrasena desde login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /olvidaste tu contraseña/i }).click()
    await expect(page).toHaveURL(/\/recuperar-contrasena$/)
  })

  test('enviar formulario de recuperacion muestra mensaje', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mensaje: 'Si el correo existe, se ha enviado un enlace' }),
      })
    })
    await page.goto('/recuperar-contrasena')
    await page.getByTestId('recuperar-email').fill('test@cinelog.test')
    await page.getByTestId('recuperar-submit').click()
    await expect(page.getByTestId('recuperar-exito')).toBeVisible()
  })

  test('formulario vacio muestra error', async ({ page }) => {
    await page.goto('/recuperar-contrasena')
    await page.getByTestId('recuperar-submit').click()
    await expect(page.getByTestId('recuperar-error')).toBeVisible()
  })
})

// ── FLUJO CORE: BUSCAR → DETALLE ──

test.describe('Flujo Core', () => {
  test('buscar y navegar a detalle de pelicula', async ({ page }) => {
    await seedSession(page)
    await mockSearchResults(page)

    await page.route('**/api/movies/tt1375666', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Rated: 'PG-13', Plot: 'A mind-bending thriller' }),
      })
    })

    await page.route('**/api/movies/mysql/tt1375666', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, imdb_id: 'tt1375666', titulo: 'Inception', rating: 0 }),
      })
    })

    await page.route('**/api/reviews/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.route('**/api/movies/trailer**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: null }),
      })
    })

    await page.goto('/buscar')
    await page.getByTestId('buscar-input').fill('Inception')
    await expect(page.getByText('Inception')).toBeVisible()
    await page.getByRole('link', { name: /Inception/i }).first().click()
    await expect(page).toHaveURL(/\/detalle\/tt1375666$/)
  })
})

// ── ROL ADMIN ──

test.describe('Rol Admin', () => {
  test('usuario admin puede ver gestion de generos', async ({ page }) => {
    await seedAdminSession(page)
    await page.route('**/api/genres', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nombre: 'Accion' }, { id: 2, nombre: 'Comedia' }]),
      })
    })
    await page.goto('/buscar')
    await expect(page.getByTestId('buscar-input')).toBeVisible()
  })
})

// ── NAVEGACION ──

test.describe('Navegacion', () => {
  test(' navbar links navegan correctamente', async ({ page }) => {
    await seedSession(page)
    await page.goto('/inicio')
    await expect(page).toHaveURL(/\/inicio$/)

    await page.goto('/buscar')
    await expect(page).toHaveURL(/\/buscar$/)

    await page.goto('/mis-listas')
    await expect(page).toHaveURL(/\/mis-listas$/)
  })

  test('paginas informativas son accesibles', async ({ page }) => {
    await seedSession(page)
    await page.goto('/acerca')
    await expect(page.getByRole('heading', { name: /Acerca de CineLog/i })).toBeVisible()

    await page.goto('/privacidad')
    await expect(page.getByRole('heading', { name: /privacidad/i })).toBeVisible()
  })
})
