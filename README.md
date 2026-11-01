# COURT 19 — NBA LIVE 19

Projeto de estudo para executar no Windows um dump próprio de NBA LIVE 19 para PS4. Esta é a primeira build pública de teste, V1.00-A.

## Estado desta versão

- Inicializa o jogo e foi possível chegar a uma partida no título CUSA11355 (APP_VER 01.25).
- A partida foi encerrada normalmente durante o teste relatado.
- Ainda há falhas gráficas visíveis durante a partida. Elas estão em investigação; esta versão não deve ser tratada como compatibilidade final.
- Outros Title IDs de NBA LIVE 19 não foram validados.

## Requisitos

- Windows x64 e driver Vulkan compatível.
- Dump próprio de NBA LIVE 19 para PS4, Title ID CUSA11355.
- Módulos de sistema PS4 fornecidos pelo próprio usuário em `user\sys_modules`, ao lado do runtime.

O pacote de Windows não inclui jogo, firmware, módulos, chaves, saves ou dados pessoais.

## Código-fonte e compilação

O runtime usa shadPS4 v0.21.0, commit `11557f2eb60b3b00712c8887c30852de7615d6df`, com alterações locais reproduzidas pelos patches e scripts deste repositório. Consulte `SOURCE-MANIFEST.txt`, `THIRD-PARTY-NOTICES.txt`, `LICENSE` e `LICENSES/`.

Este é um projeto de estudo independente; não é afiliado à EA, NBA ou Sony. As marcas e nomes de jogos pertencem aos respectivos titulares.
