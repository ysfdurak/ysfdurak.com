# Caddy + Cloudflare DNS eklentisi.
# Sertifikayı DNS doğrulamasıyla aldığı için Cloudflare proxy'sinin arkasında sorunsuz çalışır.
FROM caddy:2-builder AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
