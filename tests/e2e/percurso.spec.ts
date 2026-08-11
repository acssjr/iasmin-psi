import { expect, test } from '@playwright/test'

test('routes a minor to a responsible adult without collecting answers', async ({ page }) => {
  await page.goto('/percurso')
  await page.getByRole('button', { name: 'Sou menor de 18 anos' }).click()

  await expect(
    page.getByRole('heading', { name: /responsável/i }),
  ).toBeVisible()
  await expect(page.getByText('Pergunta 1 de 10')).toHaveCount(0)
})

test('requires consent, supports back navigation, and keeps answers out of the URL', async ({
  page,
}) => {
  await page.goto('/percurso')
  await page.getByRole('button', { name: 'Sou maior de 18 anos' }).click()

  await page.locator('#journey-name').fill('Ana Silva')
  await page.locator('#journey-email').fill('ana@example.com')
  await page.locator('#journey-whatsapp').fill('71999999999')
  await page.getByRole('button', { name: 'Começar o percurso' }).click()

  expect(
    await page.locator('#journey-purpose-consent').evaluate((input) =>
      input instanceof HTMLInputElement ? input.validity.valueMissing : false,
    ),
  ).toBe(true)
  await expect(page.getByText('Pergunta 1 de 10')).toHaveCount(0)

  await page.locator('#journey-purpose-consent').check()
  await page.getByRole('button', { name: 'Começar o percurso' }).click()
  await expect(page.getByText('Pergunta 1 de 10')).toBeVisible()

  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByText('Pergunta 2 de 10')).toBeVisible()
  await page.getByRole('button', { name: 'Voltar' }).click()
  await expect(page.getByText('Pergunta 1 de 10')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()

  for (let question = 2; question <= 10; question += 1) {
    await expect(page.getByText(`Pergunta ${question} de 10`)).toBeVisible()
    await page.getByRole('radio').first().check()

    await page
      .getByRole('button', {
        name: question === 10 ? 'Ver minha devolutiva' : 'Continuar',
      })
      .click()
  }

  await expect(page.getByText(/Esta é uma devolutiva de reflexão/i)).toBeVisible()
  expect(page.url()).not.toContain('sobrecarrega')
  expect(page.url()).not.toContain('ana@example.com')
})
