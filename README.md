# Generic Blockly Editor for YAML, XML, and more

This project provides a web-based, visual editor using Blockly to build data structures that can be exported into different formats like YAML and XML. It's designed to be generic, allowing for easy extension to other formats.

## Features

- **Visual Editing**: Drag and drop blocks to build your configuration.
- **Live Preview**: See the generated code in real-time as you edit.
- **Format Switching**: Instantly switch the output format between YAML and XML.
- **Fully Offline**: All required libraries are vendored, so no internet connection is needed after the initial setup.

## How to Run

1.  Navigate to the project directory:
    ```bash
    cd /home/tom/github/digitaltwin-run/scratch1
    ```

2.  Ensure you have the necessary Python libraries installed (Flask):
    ```bash
    # If you have a virtual environment, activate it first
    # source venv/bin/activate
    pip install flask
    ```

3.  Run the server:
    ```bash
    python3 blockly-editor.py
    ```

4.  Open your web browser and go to `http://127.0.0.1:8080`.

## Structure

- `blockly-editor.py`: The Flask server that serves the application.
- `blockly-editor.html`: The main HTML file containing the UI layout and Blockly workspace.
- `static/js/generic_blocks.js`: Custom Blockly block definitions (e.g., dictionaries, lists, XML tags).
- `static/js/generic_generators.js`: Code generators that convert blocks to YAML and XML.
- `vendor/`: Contains the core Blockly library for offline use.
