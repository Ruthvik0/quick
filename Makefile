.PHONY: frontend backend

frontend:
	cd ./assets/frontend && npm run dev &

backend:
	cd ./webview && go run main.go
