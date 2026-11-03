# COURT 19 — NBA LIVE 19

Projeto comunitário de estudo para executar no Windows um dump próprio de NBA LIVE 19 para PS4. A V1.00-A1 é um pré-lançamento com uma melhoria gráfica promissora em transparências.

## Estado da V1.00-A1

- Testada com NBA LIVE 19 CUSA11355, APP_VER 01.25, em uma partida do modo Carreira e no Play Now.
- Nessas sessões, o jogador não voltou a apresentar a transparência incorreta observada antes.
- A quadra apresentou uma ocorrência intermitente de pontos verdes, não reproduzida no reteste.
- A rede da cesta continua pontilhada/transparente. A correção gráfica não é definitiva e sessões mais longas ainda são necessárias.
- CUSA06316 e CUSA08562 permanecem sem validação e não são aceitos.

## Requisitos

- Windows x64 e driver Vulkan compatível.
- Dump próprio de NBA LIVE 19 para PS4, Title ID CUSA11355.
- Módulos de sistema PS4 fornecidos pelo próprio usuário em `user\sys_modules`, ao lado do runtime.

O pacote de Windows não inclui o jogo, firmware, módulos, chaves, saves ou logs pessoais.

## Código-fonte e compilação

A base do runtime é shadPS4 v0.21.0, commit `11557f2eb60b3b00712c8887c30852de7615d6df`. As modificações locais de integração e o experimento alpha-to-mask estão registradas nos patches deste repositório. A compilação seleciona também `externals/json` no commit `baba5db36f1747556499d70067a60b56d8989c06`. Consulte `SOURCE-MANIFEST.txt`, `THIRD-PARTY-NOTICES.txt`, `LICENSE` e `LICENSES/`.

Este é um projeto de estudo independente; não é afiliado à EA, NBA ou Sony. As marcas e nomes de jogos pertencem aos respectivos titulares.
