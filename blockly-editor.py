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
import logging
from pathlib import Path

from flask import Flask, render_template, send_from_directory, abort
from flask_cors import CORS
from waitress import serve

# --- Basic Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)

app = Flask(__name__, template_folder=".")
CORS(app)  # Enable CORS for all routes

# --- Routes ---


@app.route("/")
def index():
    """Serves the main editor page."""
    return render_template("blockly-editor.html")


@app.route("/vendor/<path:filename>")
def vendor_files(filename):
    """Serves vendored JS libraries."""
    return send_from_directory("vendor", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    """Serves custom JS files (blocks, generators)."""
    js_dir = Path("static/js")
    if not js_dir.exists():
        js_dir.mkdir(parents=True, exist_ok=True)
    return send_from_directory(js_dir, filename)


@app.route("/favicon.ico")
def favicon():
    """Serves a no-op for the browser's favicon request."""
    return "", 204


def main():
    parser = argparse.ArgumentParser(description="Generic Blockly Editor")
    parser.add_argument("--port", type=int, default=8083, help="Port for the web server")
    parser.add_argument(
        "--no-browser", action="store_true", help="Do not open a web browser"
    )
    args = parser.parse_args()

    url = f"http://127.0.0.1:{args.port}"

    if not args.no_browser:
        # Open browser in a separate thread to avoid blocking server start
        threading.Timer(1.25, lambda: webbrowser.open_new(url)).start()

    logging.info(f"Starting Generic Blockly Editor at {url}")
    logging.info("Server is running on http://0.0.0.0:%s", args.port)
    logging.info("Press Ctrl+C to exit.")
    serve(app, host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
