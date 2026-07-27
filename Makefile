.PHONY: dev-frontend dev-backend build test docker-up docker-down

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

build:
	cd frontend && npm run build
	cd backend && python -m compileall app

test:
	cd backend && pytest

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down
