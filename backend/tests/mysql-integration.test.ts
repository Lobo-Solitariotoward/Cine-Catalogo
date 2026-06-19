import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { UniqueConstraintError } from 'sequelize'
import { sequelize } from '../src/config/mysql'
import Usuario from '../src/models/mysql/Usuario'

const testEmail = (scenario: string) =>
    `db-test-${scenario}-${randomUUID()}@cinelog.test`

describe('MySQL - integracion con base de datos real', () => {
    beforeAll(async () => {
        await sequelize.authenticate()
    })

    afterAll(async () => {
        await sequelize.close()
    })

    it('ejecuta CRUD completo de usuarios con datos reales', async () => {
        const transaction = await sequelize.transaction()

        try {
            const email = testEmail('crud')

            const created = await Usuario.create(
                {
                    nombre: 'Usuario CRUD',
                    email,
                    password_hash: 'hash-de-prueba',
                },
                { transaction }
            )

            const found = await Usuario.findByPk(created.id, { transaction })
            expect(found?.email).toBe(email)

            await created.update({ nombre: 'Usuario actualizado' }, { transaction })
            await created.reload({ transaction })
            expect(created.nombre).toBe('Usuario actualizado')

            await created.destroy({ transaction })
            expect(await Usuario.findByPk(created.id, { transaction })).toBeNull()
        } finally {
            await transaction.rollback()
        }
    })

    it('revierte toda la transaccion cuando una operacion falla', async () => {
        const email = testEmail('rollback')
        const transaction = await sequelize.transaction()

        try {
            await Usuario.create(
                {
                    nombre: 'Usuario temporal',
                    email,
                    password_hash: 'hash-de-prueba',
                },
                { transaction }
            )

            await expect(
                Usuario.create(
                    {
                        nombre: 'Usuario duplicado',
                        email,
                        password_hash: 'hash-de-prueba',
                    },
                    { transaction }
                )
            ).rejects.toBeInstanceOf(UniqueConstraintError)

            await transaction.rollback()
        } catch (error) {
            if (!transaction.finished) await transaction.rollback()
            throw error
        }

        expect(await Usuario.findOne({ where: { email } })).toBeNull()
    })
})
