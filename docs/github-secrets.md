# GitHub Secrets für CI/CD

Für die automatischen Builds und Deployments werden folgende GitHub Secrets benötigt:

## Docker Hub Secrets

Diese Secrets werden für den Push zu Docker Hub benötigt:

- `DOCKERHUB_USERNAME`: Ihr Docker Hub Benutzername
- `DOCKERHUB_TOKEN`: Ein Access Token von Docker Hub (nicht Ihr Passwort)

Um ein Docker Hub Access Token zu erstellen:
1. Melden Sie sich bei [Docker Hub](https://hub.docker.com/) an
2. Gehen Sie zu Account Settings > Security > New Access Token
3. Geben Sie einen Namen für das Token ein und wählen Sie die entsprechenden Berechtigungen
4. Kopieren Sie das generierte Token (es wird nur einmal angezeigt)

## Deployment Secrets

Diese Secrets werden für das Deployment auf Ihrem Server benötigt:

- `SERVER_HOST`: Die IP-Adresse oder Domain Ihres Servers
- `SERVER_USERNAME`: Der SSH-Benutzername für den Server
- `SERVER_SSH_KEY`: Der private SSH-Schlüssel für die Verbindung zum Server

Um einen SSH-Schlüssel zu generieren:
1. Führen Sie `ssh-keygen -t ed25519 -C "github-actions"` aus
2. Kopieren Sie den Inhalt von `~/.ssh/id_ed25519.pub` auf Ihren Server in `~/.ssh/authorized_keys`
3. Kopieren Sie den Inhalt von `~/.ssh/id_ed25519` als Secret `SERVER_SSH_KEY`

## Secrets in GitHub einrichten

1. Gehen Sie zu Ihrem GitHub Repository
2. Klicken Sie auf "Settings" > "Secrets and variables" > "Actions"
3. Klicken Sie auf "New repository secret"
4. Geben Sie den Namen und Wert des Secrets ein
5. Wiederholen Sie dies für alle benötigten Secrets
