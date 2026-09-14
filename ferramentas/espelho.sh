#!/bin/bash
# Espelho entre a cópia de trabalho e o repositório Git.
#
#   SOURCE_OF_TRUTH_PATH  = /workspace/agencia-hub   (tem .git, tem remote)
#   RUNTIME_WORKTREE_PATH = /home/user/agencia-hub   (sem .git; é onde se edita
#                                                     e para onde os testes apontam)
#
# São DUAS ÁRVORES INDEPENDENTES no mesmo disco — inodes diferentes, sem mount
# compartilhado. Escrever numa NÃO aparece na outra. Verificado empiricamente.
#
#   ./espelho.sh conferir   -> lista divergências (não escreve nada)
#   ./espelho.sh enviar     -> runtime  ->  git   (o fluxo normal, antes de commitar)
#   ./espelho.sh trazer     -> git      ->  runtime (depois de pull/checkout)
set -euo pipefail
GIT=/workspace/agencia-hub
RUN=/home/user/agencia-hub

conferir() {
  echo "git     : $GIT"
  echo "runtime : $RUN"
  echo
  if diff -rq --exclude=.git "$RUN" "$GIT" > /tmp/.espelho-diff 2>&1; then
    echo "IDÊNTICOS — nenhuma divergência."
  else
    echo "DIVERGEM:"; sed 's/^/  /' /tmp/.espelho-diff
    echo
    echo "Resolva com 'enviar' (runtime vence) ou 'trazer' (git vence) antes de trabalhar."
    return 1
  fi
}

case "${1:-conferir}" in
  conferir) conferir ;;
  enviar)
    [ -d "$GIT/.git" ] || { echo "ERRO: $GIT não tem .git — abortando."; exit 1; }
    find "$GIT" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
    cp -r "$RUN"/. "$GIT"/
    echo "runtime -> git. Confira com: git -C $GIT status"
    ;;
  trazer)
    [ -d "$GIT/.git" ] || { echo "ERRO: $GIT não tem .git — abortando."; exit 1; }
    find "$RUN" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    (cd "$GIT" && git archive HEAD) | tar -x -C "$RUN"
    echo "git (HEAD) -> runtime."
    ;;
  *) echo "uso: $0 {conferir|enviar|trazer}"; exit 2 ;;
esac
