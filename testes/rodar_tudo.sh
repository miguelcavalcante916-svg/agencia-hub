#!/bin/bash
# Roda a suite inteira EM SERIE. Portas fixas (8099/8123/8144) colidem em paralelo.
cd "$(dirname "$0")"
LOG=${1:-/tmp/suite}
mkdir -p "$LOG"; rm -f "$LOG"/*.log
for t in teste_site teste_trava teste_csp teste_fontes_mobile teste_login teste_portal_trabalhos teste_app; do
  timeout 300 python3 "$t.py" > "$LOG/$t.log" 2>&1
  code=$?
  if   [ $code -eq 124 ];                             then v="BLOCKED (timeout 300s)"
  elif grep -qE "^FALHA|^ESTOURO" "$LOG/$t.log";      then v="FAIL"
  elif grep -qE "Traceback|FileNotFoundError" "$LOG/$t.log"; then v="FAIL (excecao)"
  elif [ $code -ne 0 ];                               then v="FAIL (exit $code)"
  else v="PASS"; fi
  printf '%-26s %s\n' "$t" "$v"
  sleep 2
done
