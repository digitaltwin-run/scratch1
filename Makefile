# Makefile for Blockly/YAML Editors
# Usage examples:
#   make help
#   make install
#   make serve-blockly PORT_BLOCKLY=8083
#   make edit FILE=docker-compose.yml PORT_SIMPLE=5000
#   make test
#   make compose-up
#   make docker-build IMAGE=myimage TAG=dev

SHELL := /bin/bash
.DEFAULT_GOAL := help
THIS_FILE := $(lastword $(MAKEFILE_LIST))

# Virtual environment (aligns with dependencies.sh and existing folder)
VENV ?= venv
PY    := $(VENV)/bin/python
PIP   := $(VENV)/bin/pip
BLACK := $(VENV)/bin/black
RUFF  := $(VENV)/bin/ruff
PYTEST:= $(VENV)/bin/pytest

# Ports
PORT_BLOCKLY ?= 8083
PORT_SIMPLE  ?= 8989
PORT ?= 5005

# Docker/Compose
IMAGE ?= blockly-yaml-editor
TAG   ?= latest
DOCKER_COMPOSE ?= docker compose

# File to edit with the simple editor
FILE ?=

# Detect optional files
HAVE_COMPOSE := $(firstword $(wildcard docker-compose.yml docker-compose.yaml compose.yml compose.yaml))
HAVE_DOCKERFILE := $(wildcard Dockerfile)

.PHONY: help venv install dev-deps deps-script serve-blockly edit run-blocked fmt lint test clean clean-venv stop docker-build docker-run docker-push compose-up compose-down guard-FILE port-check

help: ## Show available targets
	@grep -hE '^[a-zA-Z0-9_.-]+:.*##' $(THIS_FILE) | awk 'BEGIN {FS = ":.*##"} {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

venv: ## Create Python virtualenv (./venv)
	@test -d "$(VENV)" || python3 -m venv "$(VENV)"
	@$(PIP) -q install --upgrade pip

install: venv ## Install runtime dependencies (Flask, Flask-CORS, PyYAML, Waitress)
	@$(PIP) install -U flask flask-cors pyyaml waitress

dev-deps: venv ## Install dev tools (black, ruff, pytest)
	@$(PIP) install -U black ruff pytest

deps-script: ## Run the interactive dependency helper (dependencies.sh)
	@bash ./dependencies.sh

serve-blockly: venv ## Run blockly-editor.py (default port 8083, no-debug) server (blockly-editor.py)
	@echo "Starting Blockly editor on http://127.0.0.1:$(PORT_BLOCKLY)"
	@$(PY) blockly-editor.py --port $(PORT_BLOCKLY) --no-debug

edit: guard-FILE venv ## Open file with simple YAML/Dockerfile editor (simple-yaml-editor.py). Use FILE=...
	@echo "Editing $(FILE) at http://127.0.0.1:$(PORT_SIMPLE)"
	@$(PY) simple-yaml-editor.py "$(FILE)" --port $(PORT_SIMPLE)

run-blocked: guard-FILE venv ## Run advanced editor (blocked.py). Use FILE=...
	@echo "Running blocked.py for $(FILE) on port $(PORT_SIMPLE)"
	@$(PY) blocked.py "$(FILE)" --port $(PORT_SIMPLE)

port-check: ## Check process on a PORT (e.g., make port-check PORT=8083)
	@if [ -z "$(PORT)" ]; then \
		echo "Usage: make port-check PORT=<port_number>"; \
		exit 1; \
	fi
	@echo "Checking for process on port $(PORT)..."
	@lsof -iTCP:$(PORT) -sTCP:LISTEN -n -P || echo "No process found on port $(PORT)."

fmt: ## Format code (black, then ruff format)
	@$(BLACK) . || true
	@$(RUFF) format || true

lint: ## Lint code (ruff check)
	@$(RUFF) check || true

test: venv ## Run tests with pytest
	@$(PYTEST) -v tests/ || true

clean: ## Remove caches and build artifacts
	@find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	@rm -rf .pytest_cache build dist

clean-venv: ## Remove virtual environment (venv)
	@rm -rf "$(VENV)"

# --- Docker / Compose helpers ---

docker-build: ## Build Docker image (uses Dockerfile if present)
ifneq ($(HAVE_DOCKERFILE),)
	@docker build -t "$(IMAGE):$(TAG)" .
else
	@echo "Dockerfile not found. Skipping build."
endif

docker-run: ## Run Docker image interactively
	@docker run --rm -it -p $(PORT_BLOCKLY):$(PORT_BLOCKLY) "$(IMAGE):$(TAG)" || true

docker-push: ## Push Docker image (ensure you are logged in)
	@docker push "$(IMAGE):$(TAG)"

compose-up: ## Start services with Docker Compose (detached)
ifneq ($(HAVE_COMPOSE),)
	@$(DOCKER_COMPOSE) up -d
else
	@echo "No docker-compose*.yml found."
endif

compose-down: ## Stop services with Docker Compose
ifneq ($(HAVE_COMPOSE),)
	@$(DOCKER_COMPOSE) down
else
	@echo "No docker-compose*.yml found."
endif

stop: ## Stop all running services (Python servers and Docker Compose)
	@echo "Stopping Docker Compose services..."
	@if [ -n "$(HAVE_COMPOSE)" ]; then $(MAKE) compose-down; fi
	@echo "Stopping Python servers on ports $(PORT_SIMPLE) and $(PORT_BLOCKLY)..."
	@lsof -t -i:$(PORT_SIMPLE) | xargs -r kill -9 || true
	@lsof -t -i:$(PORT_BLOCKLY) | xargs -r kill -9 || true
	@echo "Stop command finished."

# Guards
guard-FILE:
	@if [ -z "$(FILE)" ]; then \
	  echo "Usage: make edit FILE=path/to/file.yaml [PORT_SIMPLE=5000]"; \
	  exit 1; \
	fi
