# Product analytics in T3remix

The server drops product events before queueing, identity lookup or delivery. The personal build
also excludes the vendor relay exporter and native crash reporter. Keep local diagnostics and
operator-configured OpenTelemetry receivers separate from these removed transports. See
[the privacy notes](../user/telemetry.md) for the behavior of remote connections and mobile alerts.
