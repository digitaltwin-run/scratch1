
## Status i zakres (2025-08-21)

- Co powinien robić projekt:
  - Uruchamiać broker MQTT (TCP/WS), backend bridge (I2C↔MQTT) oraz frontend.
  - Zapewniać w pełni offline edytor plików YAML/Dockerfile (bez CDN) z auto‑zapisem, kopiami zapasowymi, walidacją i testem Docker.
  - Frontend powinien serwować lokalne biblioteki (Blockly/mqtt.js/CodeMirror) – bez zależności sieciowych.

- Co jest wykonane:
  - Broker, backend i frontend działają z `docker compose up -d`.
  - Minimalny edytor offline: `1/simple-yaml-editor.py` (brak CDN), tryb „Static only” dla testu Dockerfile.
  - Legacy Blockly zdeprecjonowany; frontend zvendorowany (lokalne pliki w `frontend/vendor/`).
  - Poprawione logi (no‑op service worker), lepsze komunikaty testu Docker w trybie offline.

---

## Minimalny Offline Edytor YAML/Dockerfile (bez zależności CDN)

W katalogu `scratch/1/` dostępny jest prosty edytor tekstowy działający całkowicie offline:

```bash
cd scratch/1/
./blocked path/to/file.yaml
# lub
python3 simple-yaml-editor.py path/to/file.yaml --port 5000
```

Funkcje:

- Zapis ręczny i auto-zapis, kopie zapasowe i przywracanie
- Podstawowa walidacja/formatowanie (YAML/Dockerfile)
- Test konfiguracji Docker (`docker compose config` / `docker-compose config`)
- Brak zewnętrznych bibliotek JS/CSS – działa w środowiskach bez Internetu

Uwaga: stary edytor Blockly (`scratch/1/blocked.py`) został zdeprecjonowany i nie ładuje już skryptów z CDN. Uruchomienie go pokaże stronę z informacją o użyciu nowego edytora offline.

---
