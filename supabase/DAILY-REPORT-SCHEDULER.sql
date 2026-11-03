-- Run once in Supabase SQL Editor AFTER enabling pg_cron, pg_net and Vault.
-- Store secrets in Vault first (replace the placeholders in the two statements):
-- select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reports', 'seman_daily_report_url');
-- select vault.create_secret('YOUR_DAILY_REPORT_SECRET', 'seman_daily_report_secret');
--
-- This schedule runs at 18:00 UTC daily (20:00 Israel during winter time).
-- Adjust the cron hour for your preferred delivery time and daylight-saving changes.
select cron.schedule(
  'seman-daily-reports',
  '0 18 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'seman_daily_report_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-report-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'seman_daily_report_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
