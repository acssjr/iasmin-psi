import { expect, test } from '@playwright/test'

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`keeps the landing accessible without horizontal overflow on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    const hero = page.getByRole('region', {
      name: 'O cuidado que faz sentido começa no seu contexto.',
    })

    await expect(hero.getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
    await expect(
      hero.getByRole('link', { name: 'Iniciar meu percurso de autoconhecimento' }),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160',
      ),
    ).toBeVisible()
    expect(
      await page.locator('html').evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true)
  })
}
