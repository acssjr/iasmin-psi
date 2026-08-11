import { expect, test } from '@playwright/test'

test('routes a minor to a responsible adult without collecting answers', async ({ page }) => {
  await page.goto('/percurso')
  await page.getByRole('button', { name: 'Sou menor de 18 anos' }).click()

  await expect(
    page.getByRole('heading', { name: /responsável/i }),
  ).toBeVisible()
  await expect(page.getByText('Pergunta 1 de 5')).toHaveCount(0)
})

test('records the start consent, supports back navigation, and keeps answers out of the URL', async ({
  page,
}) => {
  let submittedBody: Record<string, unknown> | undefined
  await page.route('**/api/percursos', async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>
    await route.fulfill({ body: JSON.stringify({ ok: true }), status: 201 })
  })

  await page.goto('/percurso')
  await page.getByRole('button', { name: 'Sou maior de 18 anos' }).click()

  await page.locator('#journey-name').fill('Ana Silva')
  await page.locator('#journey-email').fill('ana@example.com')
  await page.locator('#journey-whatsapp').fill('71999999999')
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await expect(page.getByText(/Ao continuar, você concorda com o uso dos seus dados/i)).toBeVisible()
  await page.getByRole('button', { name: 'Começar o percurso' }).click()
  await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()

  await page.getByRole('radio').first().locator('..').click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByText('Pergunta 2 de 5')).toBeVisible()
  await page.getByRole('button', { name: 'Voltar' }).click()
  await expect(page.getByText('Pergunta 1 de 5')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()

  for (let question = 2; question <= 5; question += 1) {
    await expect(page.getByText(`Pergunta ${question} de 5`)).toBeVisible()
    await page.getByRole('radio').first().locator('..').click()

    await page
      .getByRole('button', {
        name: question === 5 ? 'Ver minha devolutiva' : 'Continuar',
      })
      .click()
  }

  await expect(page.getByText(/Esta é uma devolutiva de reflexão/i)).toBeVisible()
  expect(submittedBody).toMatchObject({
    adult: true,
    contactPermission: false,
    email: 'ana@example.com',
    purposeConsent: true,
  })
  expect(submittedBody?.answers).toHaveLength(5)
  expect(page.url()).not.toContain('sobrecarrega')
  expect(page.url()).not.toContain('ana@example.com')
})
