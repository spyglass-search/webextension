.PHONY: dev

default: dev

dev:
	npx webextension-toolbox dev firefox

fmt:
	npx prettier --write .