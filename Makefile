.DEFAULT_GOAL := help

GRADLE ?= gradle
NPM ?= npm

.PHONY: help install-frontend build build-backend build-frontend run-backend run-frontend test test-backend test-frontend db-up db-down

help: ## Lista os comandos disponíveis
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-frontend: ## Instala as dependências do frontend a partir do lockfile
	cd frontend && $(NPM) ci

build: build-backend build-frontend ## Compila backend e frontend

build-backend: ## Compila e verifica o backend com Gradle
	GRADLE=$(GRADLE) ./scripts/test-backend.sh build

build-frontend: ## Compila o frontend
	cd frontend && $(NPM) run build

run-backend: ## Inicia o servidor de desenvolvimento do backend
	cd backend && $(GRADLE) bootRun

run-frontend: ## Inicia o servidor de desenvolvimento do frontend
	cd frontend && $(NPM) start

test: test-backend test-frontend ## Executa os testes do backend e do frontend

test-backend: ## Executa os testes do backend
	GRADLE=$(GRADLE) ./scripts/test-backend.sh test

test-frontend: ## Executa os testes do frontend uma vez
	cd frontend && $(NPM) test -- --watch=false

db-up: ## Inicia o PostgreSQL local com volume persistente
	docker compose up -d --wait postgres

db-down: ## Para o PostgreSQL local preservando os dados
	docker compose stop postgres
