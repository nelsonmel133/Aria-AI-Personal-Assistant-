# Aria — dev shortcuts
.PHONY: install db backend web mobile test test-backend test-web lint

## Install all dependencies
install:
	npm install
	cd backend && pip install -r requirements.txt

## Apply DB schema (requires DATABASE_URL in env)
db:
	psql $$DATABASE_URL -f db/schema.sql

## Run backend (FastAPI)
backend:
	cd backend && uvicorn app.main:app --reload --port 8000

## Run web app
web:
	npm run dev --workspace=@aria/web

## Run mobile app
mobile:
	npm run start --workspace=@aria/mobile

## Run all tests
test: test-backend test-web

## Backend tests only
test-backend:
	cd backend && pytest tests -v

## Web tests only (unit + e2e)
test-web:
	npm run test --workspace=@aria/web

## Lint everything
lint:
	npm run lint

## Build for production
build:
	npm run build

## Start reminder worker
worker:
	cd backend && python -m app.workers.reminder_scanner
