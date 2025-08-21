#!/usr/bin/env python3
"""
Blockly YAML Editor
Edytor plików YAML (docker-compose, etc.) oraz Dockerfile z interfejsem Blockly
"""

import sys

try:
    import os
    import webbrowser
    import threading
    import time
    import shutil
    import traceback
    from datetime import datetime
    from pathlib import Path
    from flask import Flask, request, jsonify, render_template_string
    from flask_cors import CORS
    import argparse
    import signal
    import atexit
    import logging
    from waitress import serve
except ImportError as e:
    print(f"Error: {e}. Please install required packages.")
    print("You can run ./dependencies.sh to fix it.")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Globalne zmienne
current_file = None
current_content = None
last_saved_content = None
auto_save_thread = None
stop_auto_save = threading.Event()
backup_dir = Path(".blocked")


def create_backup(filepath):
    """Tworzy backup pliku przed edycją"""
    if not os.path.exists(filepath):
        return

    backup_dir.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{os.path.basename(filepath)}.{timestamp}"
    backup_path = backup_dir / backup_name

    shutil.copy2(filepath, backup_path)
    print(f"Backup created: {backup_path}")


def auto_save_worker():
    """Worker thread dla auto-save"""
    global current_content, last_saved_content, current_file

    while not stop_auto_save.is_set():
        time.sleep(10)
        if current_content and current_content != last_saved_content:
            try:
                with open(current_file, "w") as f:
                    f.write(current_content)
                last_saved_content = current_content
                print(f"Auto-saved: {current_file}")
            except Exception as e:
                print(f"Auto-save error: {e}")


def detect_file_type(filename):
    """Wykrywa typ pliku na podstawie nazwy"""
    filename_lower = filename.lower()
    if "docker-compose" in filename_lower:
        return "docker-compose"
    elif "dockerfile" in filename_lower:
        return "dockerfile"
    else:
        return "yaml"


@app.route("/")
def index():
    logging.info(f"Index route called. current_file: {current_file}")
    """Główna strona z edytorem Blockly"""
    global current_file

    initial_content = ""
    if os.path.exists(current_file):
        with open(current_file, "r") as f:
            initial_content = f.read()

    file_type = detect_file_type(current_file)
    is_docker = file_type in ["docker-compose", "dockerfile"]

    with open("template.html", "r") as f:
        html_template = f.read()

    return render_template_string(html_template,
                                filename=os.path.basename(current_file),
                                file_type=file_type,
                                initial_content=initial_content,
                                is_docker=is_docker)


@app.route("/save", methods=["POST"])
def save():
    """Zapisuje plik"""
    global current_content, last_saved_content, current_file

    try:
        data = request.json
        content = data.get("content", "")
        is_auto_save = data.get("auto_save", False)

        current_content = content

        if not is_auto_save or content != last_saved_content:
            with open(current_file, "w") as f:
                f.write(content)
            last_saved_content = content

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/test-docker", methods=["POST"])
def test_docker():
    """Testuje konfigurację Docker"""
    global current_file

    try:
        import subprocess

        if "docker-compose" in current_file.lower():
            # Prefer docker compose, fallback to docker-compose
            attempts = [
                ["docker", "compose", "-f", current_file, "config"],
                ["docker-compose", "-f", current_file, "config"],
            ]
            last = None
            for cmd in attempts:
                last = subprocess.run(cmd, capture_output=True, text=True)
                if last.returncode == 0:
                    result = last
                    break
            else:
                result = last
        else:  # Dockerfile
            # Build syntax check by running a quiet build (may still take time)
            result = subprocess.run(
                ["docker", "build", "-q", "-f", current_file, "."],
                capture_output=True,
                text=True,
            )

        if result.returncode == 0:
            return jsonify(
                {"success": True, "output": result.stdout[:500]}  # Pierwsze 500 znaków
            )
        else:
            return jsonify({"success": False, "error": result.stderr})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/list-backups")
def list_backups():
    """Lista dostępnych backupów"""
    try:
        if backup_dir.exists():
            backups = [
                f.name
                for f in backup_dir.iterdir()
                if f.name.startswith(os.path.basename(current_file))
            ]
            backups.sort(reverse=True)
            return jsonify({"backups": backups[:10]})  # Ostatnie 10 backupów
        return jsonify({"backups": []})
    except Exception as e:
        return jsonify({"error": str(e), "backups": []})


@app.route("/restore-backup", methods=["POST"])
def restore_backup():
    """Przywraca backup"""
    global current_file

    try:
        data = request.json
        backup_name = data.get("backup")
        backup_path = backup_dir / backup_name

        if backup_path.exists():
            shutil.copy2(backup_path, current_file)
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Backup not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


def cleanup():
    """Cleanup przy zamknięciu"""
    global stop_auto_save
    stop_auto_save.set()
    if auto_save_thread:
        auto_save_thread.join(timeout=2)


def signal_handler(sig, frame):
    """Handler dla Ctrl+C"""
    print(r'\nSaving and closing...')
    cleanup()
    sys.exit(0)


def main():
    global current_file, auto_save_thread

    parser = argparse.ArgumentParser(description="Blockly YAML/Dockerfile Editor")
    parser.add_argument("file", help="File to edit (e.g., docker-compose.yaml)")
    parser.add_argument("--port", type=int, default=5000, help="Port for web server")
    parser.add_argument(
        "--no-browser", action="store_true", help="Don't open browser automatically"
    )

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    current_file = os.path.abspath(args.file)

    # Tworzenie backupu
    create_backup(current_file)

    # Start auto-save thread
    auto_save_thread = threading.Thread(target=auto_save_worker, daemon=True)
    auto_save_thread.start()

    # Signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    atexit.register(cleanup)

    url = f"http://127.0.0.1:{args.port}"

    # Otwieranie przeglądarki
    if not args.no_browser:
        threading.Timer(1.25, lambda: webbrowser.open_new(url)).start()

    logging.info(f"Starting Blockly YAML Editor for {current_file} at {url}")
    logging.info("Server is running on http://0.0.0.0:%s", args.port)
    logging.info("Press Ctrl+C to exit.")

    # Start Waitress server
    serve(app, host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()
        sys.exit(1)
