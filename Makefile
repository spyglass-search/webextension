.PHONY: build

default: build

build:
	npx tailwindcss -i ./app/styles/main.css -o ./dist/popup/styles.css

watch:
	npx tailwindcss -i ./app/styles/main.css -o ./dist/popup/styles.css --watch

run-ext:
	npx web-ext run --devtools