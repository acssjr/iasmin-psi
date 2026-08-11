import { expect, test } from '@playwright/test'

test('shows both first-step actions', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Iniciar meu percurso de autoconhecimento' }),
  ).toBeVisible()
})
