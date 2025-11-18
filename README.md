# JumpQuiz - Django + Phaser (Jump & Quiz game)
This package contains a Django backend (API) and a simple Phaser frontend (HTML/JS).

## What is included
- backend/: Django project with `questions` app (models: Question, Score)
- frontend/: Phaser 3 game (index.html, game.js) that fetches yes/no ITIL questions from the backend.
- assets/: placeholder sprites (player, star, pipes, blocks) and a pixel logo.
- seed_itil.py: script to seed ITIL yes/no questions into the DB (intended to be run within Django environment).
- README.md (this file) — note: this README intentionally contains no install/run commands as requested.

## Notes
- The frontend calls `/api/random-question/` to fetch a yes/no ITIL question. It expects a JSON response like: { id, text, answer }.
- When the player jumps on a question block the question shows; the player selects yes/no by entering the respective pipe.
- Score submission endpoint: POST /api/submit-score/ (JSON body: { name, points }).
- Top scores endpoint: GET /api/top-scores/ (returns last top 20 scores).
