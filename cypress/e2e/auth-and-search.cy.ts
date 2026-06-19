import { seedSession, seedAdminSession } from '../support/e2e'

// ── AUTH ──

describe('Autenticacion', () => {
  it('ruta protegida redirige visitantes a login', () => {
    cy.visit('/inicio')
    cy.url().should('match', /\/login$/)
  })

  it('login muestra validacion con aria-live', () => {
    cy.visit('/login')
    cy.getByTestId('login-submit').click()
    cy.getByTestId('login-error').should('contain', 'completa')
  })

  it('login exitoso navega al inicio', () => {
    cy.visit('/login')
    cy.intercept('**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'token-e2e',
        usuario: { id: 1, nombre: 'QA User', email: 'qa@cinelog.test', rol: 'user' },
      },
    })

    cy.getByTestId('login-email').type('qa@cinelog.test')
    cy.getByTestId('login-password').type('Test1234')
    cy.getByTestId('login-submit').click()
    cy.url().should('match', /\/inicio$/)
  })

  it('login con credenciales invalidas muestra error', () => {
    cy.visit('/login')
    cy.intercept('**/api/auth/login', {
      statusCode: 401,
      body: { error: 'Credenciales invalidas' },
    })

    cy.getByTestId('login-email').type('wrong@test.com')
    cy.getByTestId('login-password').type('wrongpass')
    cy.getByTestId('login-submit').click()
    cy.getByTestId('login-error').should('be.visible')
  })

  it('logout limpia sesion y redirige a login', () => {
    seedSession()
    cy.visit('/perfil')
    cy.contains('button', /cerrar/i).click()
    cy.url().should('match', /\/login$/)
  })
})

// ── REGISTRO ──

describe('Registro', () => {
  it('registro valida password debil y expone error accesible', () => {
    cy.visit('/registro')
    cy.getByTestId('registro-nombre').type('QA User')
    cy.getByTestId('registro-email').type('qa@cinelog.test')
    cy.getByTestId('registro-password').type('weak')
    cy.getByTestId('registro-confirmar').type('weak')
    cy.getByTestId('registro-submit').click()
    cy.getByTestId('registro-error').should('contain', 'contraseña')
  })

  it('registro exitoso navega al inicio', () => {
    cy.visit('/registro')
    cy.intercept('**/api/auth/register', {
      statusCode: 201,
      body: {
        token: 'token-e2e',
        usuario: { id: 1, nombre: 'QA User', email: 'qa@cinelog.test', rol: 'user' },
      },
    })

    cy.getByTestId('registro-nombre').type('QA User')
    cy.getByTestId('registro-email').type('qa@cinelog.test')
    cy.getByTestId('registro-password').type('Test1234')
    cy.getByTestId('registro-confirmar').type('Test1234')
    cy.getByTestId('registro-submit').click()
    cy.url().should('match', /\/inicio$/)
  })
})

// ── BUSQUEDA ──

describe('Busqueda', () => {
  it('buscar muestra resultados', () => {
    seedSession()
    cy.visit('/buscar')
    cy.intercept('**/api/movies/search**', {
      statusCode: 200,
      body: {
        resultados: [
          { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'N/A' },
          { imdbID: 'tt0137523', Title: 'Fight Club', Year: '1999', Type: 'movie', Poster: 'N/A' },
        ],
      },
    })

    cy.getByTestId('buscar-input').type('Inception')
    cy.contains('Inception').should('be.visible')
  })

  it('buscar error de servidor muestra mensaje de error', () => {
    seedSession()
    cy.visit('/buscar')
    cy.intercept('**/api/movies/search**', {
      statusCode: 500,
      body: { error: 'fallo' },
    })

    cy.getByTestId('buscar-input').type('server-error')
    cy.contains(/Error al buscar|fallo/i).should('be.visible')
  })

  it('limpiar busqueda borra el input', () => {
    seedSession()
    cy.visit('/buscar')
    cy.intercept('**/api/movies/search**', {
      statusCode: 200,
      body: {
        resultados: [
          { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'N/A' },
        ],
      },
    })

    cy.getByTestId('buscar-input').type('Inception')
    cy.getByTestId('buscar-input').should('have.value', 'Inception')
    cy.get('input[data-testid="buscar-input"]').parent().find('button').click()
    cy.getByTestId('buscar-input').should('have.value', '')
  })
})

// ── RECUPERAR CONTRASENA ──

describe('Recuperar Contrasena', () => {
  it('navegar a recuperar contrasena desde login', () => {
    cy.visit('/login')
    cy.contains('a', /olvidaste tu contraseña/i).click()
    cy.url().should('match', /\/recuperar-contrasena$/)
  })

  it('enviar formulario de recuperacion muestra mensaje', () => {
    cy.visit('/recuperar-contrasena')
    cy.intercept('**/api/auth/forgot-password', {
      statusCode: 200,
      body: { mensaje: 'Si el correo existe, se ha enviado un enlace' },
    })

    cy.getByTestId('recuperar-email').type('test@cinelog.test')
    cy.getByTestId('recuperar-submit').click()
    cy.getByTestId('recuperar-exito').should('be.visible')
  })

  it('formulario vacio muestra error', () => {
    cy.visit('/recuperar-contrasena')
    cy.getByTestId('recuperar-submit').click()
    cy.getByTestId('recuperar-error').should('be.visible')
  })
})

// ── FLUJO CORE: BUSCAR → DETALLE ──

describe('Flujo Core', () => {
  it('buscar y navegar a detalle de pelicula', () => {
    seedSession()
    cy.visit('/buscar')

    // Mock search results
    cy.intercept('**/api/movies/search**', {
      statusCode: 200,
      body: {
        resultados: [
          { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'N/A' },
        ],
      },
    })

    // Mock movie details - cambios
    cy.intercept('**/api/movies/tt1375666', {
      statusCode: 200,
      body: { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Rated: 'PG-13', Plot: 'A mind-bending thriller' },
    })

    // Mock MySQL data
    cy.intercept('**/api/movies/mysql/tt1375666', {
      statusCode: 200,
      body: { id: 1, imdb_id: 'tt1375666', titulo: 'Inception', rating: 0 },
    })

    // Mock reviews
    cy.intercept('**/api/reviews/1', {
      statusCode: 200,
      body: [],
    })

    // Mock trailer
    cy.intercept('**/api/movies/trailer**', {
      statusCode: 200,
      body: { url: null },
    })

    cy.getByTestId('buscar-input').type('Inception')
    cy.contains('a', /Inception/i).first().click()
    cy.url().should('match', /\/detalle\/tt1375666$/)
  })
})

// ── ROL ADMIN ──

describe('Rol Admin', () => {
  it('usuario admin puede ver gestion de generos', () => {
    seedAdminSession()
    cy.visit('/buscar')
    cy.intercept('**/api/genres', {
      statusCode: 200,
      body: [{ id: 1, nombre: 'Accion' }, { id: 2, nombre: 'Comedia' }],
    })

    cy.getByTestId('buscar-input').should('be.visible')
  })
})

// ── NAVEGACION ──

describe('Navegacion', () => {
  it('navbar links navegan correctamente', () => {
    seedSession()
    cy.visit('/inicio')
    cy.url().should('match', /\/inicio$/)

    cy.visit('/buscar')
    cy.url().should('match', /\/buscar$/)

    cy.visit('/mis-listas')
    cy.url().should('match', /\/mis-listas$/)
  })

  it('paginas informativas son accesibles', () => {
    seedSession()
    cy.visit('/acerca')
    cy.contains('h1', /Acerca de CineLog/i).should('be.visible')

    cy.visit('/privacidad')
    cy.contains('h2', /Qué datos guardamos/i).should('be.visible')
  })
})
