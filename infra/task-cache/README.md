# Optional self-hosted task cache

Ordinary builds run locally. Operators can deploy a private Vite+ cache in their own Cloudflare account using the `RemixWorkbenchTaskCache` Alchemy stack. It uses D1 and R2 for cache data. Supply the repository policy and writer and reader keys for your deployment. A new database has no upload policy.

For a checkout that uses the cache, create a local `.task-cache.json` containing an `endpoint` such as `https://cache.example.com/projects/t3code`. Use `bash infra/task-cache/install.sh` to configure the optional hook. The setup tests the credential at `/verify` and stores it with mode 0600 under `~/.config/t3remix-task-cache`. Public endpoints require HTTPS. HTTP is supported for loopback tests. Remove the hook with `bash infra/task-cache/install.sh --uninstall`.

Run `node infra/task-cache/scripts/smoke.ts` to test your deployed cache with a disposable project. The server accepts authenticated cache and native-client artifact traffic. Legacy task telemetry POSTs receive HTTP 410.
