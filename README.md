# Pipeline DevSecOps

Frontend estático (Nginx sem root) e uma pipeline no GitHub Actions que leva o código do commit até um cluster **kind**, com análise de qualidade e de segurança.

## Fluxo

```
push na main
   ├── sonar        → SonarCloud: bugs, vulnerabilidades e code smells (Quality Gate)
   └── trivy-code   → Trivy fs: dependências, segredos e misconfig (Dockerfile e k8s)
          ↓
   build-push       → docker build → Trivy na imagem → push no Docker Hub (tag = SHA do commit)
          ↓
   deploy           → cria o cluster kind → kubectl apply → rollout → teste com curl
```

Se o Quality Gate reprovar ou o Trivy achar algo **HIGH/CRITICAL**, a pipeline para e a imagem não é publicada.

Em pull requests, a pipeline roda as análises e o build, mas não faz push nem deploy.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `app/src/` | Frontend (HTML, CSS, JS) |
| `app/Dockerfile` | Imagem `nginx-unprivileged`, porta 8080, usuário 101 |
| `k8s/` | Deployment e Service |
| `sonar-project.properties` | Configuração do SonarCloud |
| `.github/workflows/devsecops.yml` | A pipeline |

## Configuração

**GitHub → Settings → Secrets and variables → Actions**

| Tipo | Nome | Valor |
|---|---|---|
| Secret | `SONAR_TOKEN` | Token do SonarCloud (My Account → Security) |
| Secret | `DOCKERHUB_TOKEN` | Personal access token do Docker Hub (Read & Write) |
| Variable | `DOCKERHUB_USERNAME` | Usuário do Docker Hub |

**SonarCloud:** importe o repositório, preencha `sonar.organization` e `sonar.projectKey` no `sonar-project.properties` e desligue a *Automatic Analysis* em Administration → Analysis Method.

## Rodar localmente

```bash
docker build -t devsecops-front app
docker run --rm -p 8080:8080 devsecops-front
# http://localhost:8080
```

## Integrantes

- Hian Rick
- Patricia Morais
- Katleen Martins
