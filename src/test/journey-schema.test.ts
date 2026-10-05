// @vitest-environment node
import { afterAll, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ sql: vi.fn(), query: vi.fn(), transaction: vi.fn() }))
vi.mock('@neondatabase/serverless', () => ({ neon: () => Object.assign(mocks.sql, { query: mocks.query, transaction: mocks.transaction }) }))
import { ensureJourneySchema, journeySchemaStatements } from '@/lib/journey-schema'
afterAll(() => vi.unstubAllEnvs())
it('retries failures and performs one locked additive transaction for concurrent callers', async () => {
  vi.stubEnv('DATABASE_URL', 'postgresql://example.test/test')
  mocks.sql.mockResolvedValue([]); mocks.query.mockResolvedValue([])
  mocks.transaction.mockRejectedValueOnce(new Error('temporary failure')).mockImplementation(async builder => { builder(Object.assign(mocks.sql, { query: mocks.query })); return [] })
  await expect(ensureJourneySchema()).rejects.toThrow('temporary failure')
  await Promise.all([ensureJourneySchema(), ensureJourneySchema()])
  expect(mocks.transaction).toHaveBeenCalledTimes(2)
  expect(mocks.query.mock.calls.map(([statement]) => statement)).toEqual(journeySchemaStatements)
  expect(mocks.sql.mock.calls.some(([parts]) => parts.join('').includes('pg_advisory_xact_lock'))).toBe(true)
  expect(journeySchemaStatements.join('\n')).not.toMatch(/DROP TABLE|TRUNCATE|DELETE FROM/i)
  await ensureJourneySchema()
  expect(mocks.transaction).toHaveBeenCalledTimes(2)
})
