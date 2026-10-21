# Survive Chaos Mobile

Repositório exclusivo da versão Android/Mobile do Survive Chaos.

A versão de navegador continua em `V-prof1/Survive-Chaos`. Este repositório baixa a base web durante o GitHub Actions e aplica apenas as diferenças específicas do Android antes de gerar o APK.

## Diferenças Mobile atuais

- Q = Dash e E = ULT no teclado.
- Interface visual Beta 0.1 e ícone Android personalizado herdados da base atual.
- Modo Infinito com hordas exponenciais por minuto.
- Horda especial: `16 × 1.24^(minuto - 1)` inimigos, limitada apenas pelo teto adaptativo de segurança do aparelho.
- Pressão do spawn normal também aumenta exponencialmente no Infinito.
- Teto de inimigos do modo Infinito cresce conforme o tempo e se adapta ao FPS, chegando a até 1200 inimigos vivos.
- Build Android automático independente do repositório de navegador.
- Assinatura DEBUG da Beta Mobile é preservada via cache do GitHub Actions para que builds Mobile futuras instalem como atualização umas sobre as outras.

## APK

Cada mudança Mobile relevante dispara `.github/workflows/build-apk.yml` e gera o artefato `Survive-Chaos-Mobile-APK`.
