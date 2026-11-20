# Ölçüm servisi: bağımlılık yok, yalnızca Node 24 (yerleşik node:sqlite).
#   docker build -t olcum .
FROM node:24-alpine
ENV NODE_ENV=production VERI_DIZINI=/veri PORT=8080
WORKDIR /app
COPY package.json sunucu.js o.js ./
RUN mkdir -p /veri && chown node:node /veri
USER node
VOLUME ["/veri"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "sunucu.js"]
