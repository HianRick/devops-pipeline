# Preparar o PC da apresentação (runner self-hosted + kind)

O job **Deploy no kind (self-hosted)** da pipeline roda numa máquina do grupo, não na nuvem do GitHub.
Este guia deixa um PC Windows pronto para receber esse deploy e servir o site em **http://localhost:8080**.

Tempo estimado: 20 a 30 minutos (a maior parte é instalação do Docker Desktop).

---

## 1. Docker Desktop

```powershell
winget install --id Docker.DockerDesktop -e
```

1. Reinicie o PC se o instalador pedir.
2. Abra o **Docker Desktop** e aceite os termos. Se pedir para instalar/atualizar o **WSL 2**, aceite.
3. Espere aparecer **Engine running** no canto inferior esquerdo.

Conferir (em um PowerShell novo):

```powershell
docker version
kubectl version --client
```

O `kubectl` já vem junto com o Docker Desktop.

## 2. kind

```powershell
winget install --id Kubernetes.kind -e
```

**Feche e abra o PowerShell de novo** para o comando aparecer no PATH, e confira:

```powershell
kind version
```

> Não precisa criar o cluster na mão: a própria pipeline cria o cluster `devsecops` no primeiro deploy,
> usando o arquivo `kind/kind-config.yaml` (que expõe o site na porta 8080).

## 3. Registrar o runner no repositório

Quem faz este passo precisa ser **dono/admin** do repositório (HianRick).

1. No GitHub: **HianRick/devops-pipeline → Settings → Actions → Runners → New self-hosted runner**.
2. Escolha **Windows** e **x64**.
3. Rode os comandos da seção **Download** que a página mostra (eles criam `C:\actions-runner` e baixam o runner).
4. Na seção **Configure**, use o token que a página mostra, mas com estes parâmetros:

```powershell
cd C:\actions-runner
.\config.cmd --url https://github.com/HianRick/devops-pipeline --token <TOKEN_DA_PAGINA> --name pc-apresentacao --labels kind --work _work
```

Respostas durante a configuração:

| Pergunta | Resposta |
|---|---|
| Runner group | Enter (Default) |
| Run as service? | **N** |

> **Por que não como serviço?** Como serviço, o runner roda com outro usuário do Windows
> e não enxerga o Docker Desktop nem o cluster kind do seu usuário. Rodando numa janela, funciona direto.

O token da página **expira em 1 hora**. Se expirar, é só recarregar a página para gerar outro.

## 4. Ligar o runner

```powershell
cd C:\actions-runner
.\run.cmd
```

Deve aparecer `Listening for Jobs`. **Deixe essa janela aberta** — fechou, o runner fica offline.

Confira no GitHub (**Settings → Actions → Runners**): `pc-apresentacao` com status **Idle**
e os labels `self-hosted`, `Windows`, `X64`, `kind`.

> Instale o Docker e o kind **antes** de abrir o `run.cmd`. O runner herda o PATH do momento em que foi aberto;
> se instalar algo depois, feche e abra o `run.cmd` de novo.

## 5. Primeiro deploy

1. No GitHub: **Actions → DevSecOps Pipeline → Run workflow → main → Run workflow**.
2. Acompanhe: Sonar e Trivy rodam na nuvem; o job **Deploy no kind (self-hosted)** aparece na janela do runner (`Running job: ...`).
3. Na primeira vez o deploy demora um pouco mais (baixa a imagem do nó do kind, ~1–2 min).
4. Abra **http://localhost:8080**.

Conferir pelo terminal:

```powershell
kind get clusters                 # deve listar: devsecops
kubectl get pods,svc              # 2 pods "front" Running e o service NodePort 80:30080
kubectl get deployment front -o jsonpath="{.spec.template.spec.containers[0].image}"
# a tag da imagem deve ser o SHA do último commit da main
```

## 6. Segurança (fazer uma vez)

Como o repositório é **público** e o runner executa código no PC, confira em
**Settings → Actions → General → Fork pull request workflows from outside collaborators**
que está marcado **Require approval for all outside collaborators**.
Assim nenhum PR de fora roda na máquina sem aprovação.

---

## Checklist do dia da apresentação

- [ ] Docker Desktop aberto e **Engine running** (o cluster kind volta junto com ele)
- [ ] Janela do `run.cmd` aberta com `Listening for Jobs`
- [ ] Em Settings → Runners, **só** o `pc-apresentacao` aparece, e está **Idle**
- [ ] http://localhost:8080 abrindo o Rango Rápido
- [ ] Abas abertas no navegador:
  - GitHub Actions do repositório
  - Security → Code scanning
  - SonarCloud do projeto
  - Docker Hub (`hian286/devsecops-front` → Tags)
  - http://localhost:8080
- [ ] PR de demonstração já aberto e com os checks vermelhos (ver `codigo-com-erros.js`)

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Deploy parado em *Waiting for a runner* | Runner offline ou label diferente | Abrir o `run.cmd`; conferir o label `kind` |
| `kind : O termo 'kind' não é reconhecido` | `run.cmd` aberto antes de instalar o kind | Fechar e abrir o `run.cmd` de novo |
| `Cannot connect to the Docker daemon` | Docker Desktop fechado | Abrir o Docker Desktop e esperar *Engine running* |
| Pods em `ErrImagePull` / `ImagePullBackOff` | Variável `DOCKERHUB_USERNAME` errada ou imagem não publicada | Conferir em Settings → Secrets and variables → Actions → **Variables** |
| `port is already allocated` / 8080 ocupada | Outro programa usando a porta 8080 | Fechar o programa ou `kind delete cluster --name devsecops` e rodar a pipeline de novo |
| Site não abre depois de reiniciar o PC | Docker Desktop ainda subindo | Esperar *Engine running*; o cluster volta sozinho |

## Depois da apresentação

Para tirar o runner do PC:

```powershell
# Pare o run.cmd (Ctrl+C) e depois:
cd C:\actions-runner
.\config.cmd remove --token <TOKEN>
```

O token de remoção aparece em **Settings → Actions → Runners → pc-apresentacao → Remove**.
Para apagar o cluster: `kind delete cluster --name devsecops`.
