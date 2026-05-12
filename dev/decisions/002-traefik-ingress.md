# ADR-002: Traefik Ingress with IP Whitelist

Date: 2026-05-11
Status: Accepted

## Context

The API server needs to be reachable from the frontend and from home/WireGuard clients, but should not be publicly accessible without application-level auth in place. Traefik is already running in the k3s cluster as the ingress controller.

## Decision

Use a Traefik `Ingress` resource with:
- TLS termination via cert-manager (`cert-manager-acme-issuer`)
- `wireguard-and-home-ip-whitelist` middleware — restricts access to the k3s pod CIDR (`10.42.0.0/16`) and home LAN (`192.168.0.0/24`)
- `redirect` middleware — enforces HTTPS

Both middleware CRDs are created in the `air-monitor` namespace by the Helm chart so they are self-contained and don't depend on middleware defined in other namespaces.

## Consequences

- Service is not publicly accessible without being on the home network or WireGuard — provides network-level access control without application auth
- Adding a new allowed IP range requires updating the middleware in `helm/air-monitor-api-server/templates/middleware.yaml` and redeploying
- When application-level auth is added, the IP whitelist can be relaxed or removed
