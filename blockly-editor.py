#!/usr/bin/env python3
"""
Generic Blockly Editor Server

Serves a Blockly-based UI for visually editing generic data structures
that can be exported to YAML, XML, and other formats.
"""

import argparse
import os
import webbrowser
import threading
import time
from flask import Flask, render_template, abort, send_from_directory
from pathlib import Path

app = Flask(__name__, template_folder='.')

# --- Routes ---

@app.route('/')
def index():
    """Serves the main editor page."""
    return render_template('blockly-editor.html')

@app.route('/vendor/<path:filename>')
def vendor_files(filename):
    """Serves vendored JS libraries."""
    return send_from_directory('vendor', filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    """Serves custom JS files (blocks, generators)."""
    js_dir = Path('static/js')
    if not js_dir.exists():
        js_dir.mkdir(parents=True, exist_ok=True)
    return send_from_directory(js_dir, filename)


def main():
    parser = argparse.ArgumentParser(description='Generic Blockly Editor')
    parser.add_argument('--port', type=int, default=8083, help='Port for web server')
    parser.add_argument('--no-browser', action='store_true', help="Don't open browser")
    args = parser.parse_args()

    url = f'http://127.0.0.1:{args.port}'

    if not args.no_browser:
        webbrowser.open_new(url)

    print(f"Starting Generic Blockly Editor at {url}")
    print("Press Ctrl+C to exit")
    app.run(host='0.0.0.0', port=args.port, debug=True)

if __name__ == '__main__':
    main()
