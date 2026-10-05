-- Preserva os textos publicados no momento de cada novo envio.
-- Registros anteriores permanecem sem snapshot; o painel identifica essa condição.
ALTER TABLE journey_submissions
  ADD COLUMN IF NOT EXISTS answer_snapshot JSONB;
