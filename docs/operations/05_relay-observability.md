# Self-hosted relay diagnostics

Check `/health` on the relay origin configured for your deployment. For an unreachable environment, check the tunnel in your Cloudflare account and the connection reported by the host. For failed notifications, check your configured APNs or FCM credentials.

The mobile telemetry ingest route returns HTTP 410. The relay discards these requests and provisions no mobile telemetry storage or dashboards.
