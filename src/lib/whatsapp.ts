const DEFAULT_WHATSAPP_NUMBER = '5575981234176'
const schedulingMessage = 'Olá, Iasmin. Gostaria de agendar uma sessão de psicoterapia.'
const privacyMessage = 'Olá, Iasmin. Gostaria de falar sobre meus dados pessoais.'

function getWhatsAppHref(message: string) {
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')
  const number = configuredNumber || DEFAULT_WHATSAPP_NUMBER

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function getSchedulingWhatsAppHref() {
  return getWhatsAppHref(schedulingMessage)
}

export function getPrivacyWhatsAppHref() {
  return getWhatsAppHref(privacyMessage)
}
