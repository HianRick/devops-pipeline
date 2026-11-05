# Nginx sem root: escuta na porta 8080 e roda com o usuário 101
FROM nginxinc/nginx-unprivileged:stable-alpine

# Aplica as correções de segurança dos pacotes do Alpine que ainda não
# chegaram na imagem base (apontadas pelo Trivy). Precisa de root só aqui.
USER root
RUN apk upgrade --no-cache

COPY --chown=101:101 src/ /usr/share/nginx/html/

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
