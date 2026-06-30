Zootech Frontend
================

Zootech is a livestock management system. This repository contains the web
frontend — a Single Page Application built with Angular 21 standalone components,
TypeScript, and ngx-translate for multilingual support (es, en, pt, fr).

Quick Start
-----------

* Clone and install: `git clone <repo-url> && cd Zootech-frontend && pnpm install`
* Run locally: `pnpm start` → http://localhost:4200
* Run tests: `pnpm test`
* Report an issue: contact the team on the project board
* Read the docs: docs/


Who Are You?
============

Find your role below:

* New Team Member       — setting up the project for the first time
* Feature Developer     — building or modifying application features
* QA / Tester           — running and writing tests
* DevOps / CI           — pipeline and deployment configuration


For Specific Users
==================

New Team Member
---------------

Start here before touching any code:

* Getting started:    docs/guides/getting-started.md
* Project structure:  docs/architecture/project-structure.md
* Architecture:       docs/architecture/overview.md
* Naming conventions: docs/conventions/naming.md
* Git workflow:       docs/conventions/git-workflow.md

Requirements: Node.js 22+, pnpm 10+, Git.

To install and run:

    git clone <repo-url>
    cd Zootech-frontend
    pnpm install
    pnpm start

Feature Developer
-----------------

Read conventions before writing a single line:

* Adding a module:      docs/guides/adding-module.md
* Adding a feature:     docs/guides/adding-feature.md
* Adding a component:   docs/guides/adding-component.md
* Component patterns:   docs/patterns/component-patterns.md
* Routing patterns:     docs/patterns/routing-patterns.md
* State management:     docs/patterns/state-management.md
* Styling patterns:     docs/patterns/styling-patterns.md
* i18n conventions:     docs/conventions/i18n.md
* TypeScript style:     docs/conventions/typescript.md

Key rules enforced in code review:

* No NgModules — everything is standalone
* Prefix all components with zt-
* Use ChangeDetectionStrategy.OnPush
* No hardcoded text — use i18n keys in src/assets/i18n/
* No hardcoded colors — use CSS variables from src/styles.css
* No utility-first CSS — semantic class names only

Architecture layers (add a layer only when it has real code):

    domain/          Models, contracts, business rules
    application/     Facades and use cases
    infrastructure/  API clients and repositories
    presentation/    Angular components and views

QA / Tester
-----------

* Testing guide:  docs/guides/testing.md

Run unit tests:

    pnpm test              # interactive watch mode
    pnpm run test:ci       # single run with coverage report

Run end-to-end tests:

    pnpm run e2e           # headless
    pnpm run e2e:ui        # Playwright UI mode

Coverage reports are generated at coverage/lcov.info and uploaded to SonarQube
on every push to develop via Azure Pipelines.

DevOps / CI
-----------

* Pipeline file: azure-pipelines.yml
* Triggers on:   develop branch (push and PR)
* Steps:         install → build → test with coverage → SonarQube analysis
* Quality gate:  ZooTech Gate (defined in SonarQube)
* Coverage tool: Vitest + Istanbul → lcov.info → sonar.javascript.lcov.reportPaths


Commands Reference
==================

    pnpm start                   Start local dev server (port 4200)
    pnpm run build               Production build to dist/
    pnpm run watch               Build in watch mode
    pnpm test                    Unit tests (Vitest, interactive)
    pnpm run test:ci             Unit tests with coverage (single run)
    pnpm run e2e                 End-to-end tests (Playwright, headless)
    pnpm run e2e:ui              End-to-end tests (Playwright UI)
    npx prettier --write .       Format entire project


Troubleshooting
===============

Clean local installation:

    # Linux / macOS
    rm -rf node_modules .angular
    pnpm install

    # Windows PowerShell
    Remove-Item -Recurse -Force node_modules, .angular
    pnpm install

Port 4200 already in use:

    pnpm start -- --port 4201
