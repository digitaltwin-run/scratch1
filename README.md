# Generic Blockly Editor for YAML, XML, and more

This project provides a web-based, visual editor using Blockly to build data structures that can be exported into different formats like YAML and XML. It's designed to be generic, allowing for easy extension to other formats.

## Features

- **Visual Editing**: Drag and drop blocks to build your configuration.
- **Live Preview**: See the generated code in real-time as you edit.
- **Format Switching**: Instantly switch the output format between YAML and XML.
- **Fully Offline**: All required libraries are vendored, so no internet connection is needed after the initial setup.

## Quick Start

The repository includes a `Makefile` with common tasks. Recommended is the minimal offline editor.

1) Setup Python environment
```bash
make venv install    # creates ./venv and installs Flask, Flask-CORS, PyYAML
make dev-deps        # optional: black, ruff, pytest
```

2) Edit a file using the minimal offline editor (recommended)
```bash
make edit FILE=docker-compose.yml           # default port 5000
# or choose a port
make edit FILE=Dockerfile PORT_SIMPLE=5001
```
Then open: http://127.0.0.1:5000 (or your chosen port)

3) Optional: run the legacy Blockly editor UI
```bash
make serve-blockly PORT_BLOCKLY=8083
```
Then open: http://127.0.0.1:8083

Notes:
- If a port is in use, pick another (e.g., `PORT_SIMPLE=5002`) or free it (see Troubleshooting).
- For interactive dependency checks: `make deps-script` (runs `dependencies.sh`).

## Structure

- `simple-yaml-editor.py`: Minimal offline editor (YAML/Dockerfile/docker-compose) with save/auto-save, backups, validation.
- `blockly-editor.py`: Legacy Blockly-based server for visual editing (optional).
- `blockly-editor.html`: HTML page for the Blockly UI.
- `static/js/generic_blocks.js`: Custom Blockly block definitions (e.g., dictionaries, lists, XML tags).
- `static/js/generic_generators.js`: Generators to convert blocks to YAML/XML.
- `vendor/`: Vendored Blockly for offline usage.
- `dependencies.sh`: Interactive helper to check/install Python deps.
- `tests/`: Contains tests like `tests/test_simple_yaml_editor.py`.
- `Makefile`: Convenience tasks (venv/install, edit, serve-blockly, lint, fmt, test, docker, compose).

## Troubleshooting

- Port already in use:
  - Use a different port, e.g., `make edit FILE=... PORT_SIMPLE=5002`.
  - Identify process using a port:
    ```bash
    ss -ltnp | grep :8083    # or :5000
    # or
    lsof -iTCP:8083 -sTCP:LISTEN -n -P
    ```
  - Stop the process: `kill -TERM <pid>` (or `kill -9 <pid>` if needed).

- Missing dependencies:
  - Run `make venv install` (recommended) or `make deps-script` for guided setup.

- Offline usage:
  - All required JS libraries are in `vendor/`. The minimal editor has no CDN dependencies.
