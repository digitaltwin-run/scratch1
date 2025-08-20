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

## How It Works

The editor is built on three main components:

1.  **Block Definitions** (`generic_blocks.js`): This file defines the shape, color, and inputs of each custom block. It also includes "mutator" logic, which allows blocks like dictionaries and lists to be dynamically resized by the user.

2.  **Code Generators** (`generic_generators.js`): For each format (YAML, XML), a generator is defined. These generators contain functions that correspond to each block type. When the user requests to generate code, Blockly traverses the workspace tree and calls the appropriate function for each block, building the final text output.

3.  **Flask Server** (`blockly-editor.py`): A simple Python web server that serves the main HTML file and the necessary JavaScript assets. It does not handle any file I/O or complex logic, keeping the application entirely client-side.

## Customization

To extend the editor with new blocks or a new output format, follow these steps:

### Adding a New Block

1.  **Define the block**: Add a new entry in `static/js/generic_blocks.js`, specifying its appearance and inputs.
2.  **Add it to the toolbox**: Add a `<block>` tag for your new block in the `<xml id="toolbox">` section of `blockly-editor.html`.
3.  **Implement generators**: For each supported format (e.g., YAML, XML), add a corresponding generator function in `static/js/generic_generators.js` that defines how the block should be converted to text.

### Adding a New Output Format

1.  **Create a new generator**: In `static/js/generic_generators.js`, create a new generator object (e.g., `Blockly.JSON = new Blockly.Generator('JSON');`).
2.  **Implement block handlers**: For the new generator, implement a function for each block type (e.g., `Blockly.JSON['dict_create_with'] = function(block) { ... };`).
3.  **Add to UI**: Add a new `<option>` to the `#formatSelector` dropdown in `blockly-editor.html`.
4.  **Update logic**: Modify the `generateCode()` function in `blockly-editor.html` to use your new generator when its format is selected.
