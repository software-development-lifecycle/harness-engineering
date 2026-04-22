# Python Knowledge

## Project Structure
- `requirements.txt` or `Pipfile` or `pyproject.toml` — dependencies
- `setup.py` or `setup.cfg` — package configuration
- `manage.py` — Django management CLI
- `app.py` or `main.py` or `wsgi.py` — application entry point
- `src/` or project-name directory — main source package
- `models.py` or `models/` — data models
- `views.py` or `views/` — request handlers (Django)
- `routes.py` or `api/` — API endpoints (Flask/FastAPI)
- `services/` — business logic layer
- `schemas/` — Pydantic models or serializers
- `migrations/` or `alembic/` — database migrations
- `tests/` — test directory
- `conftest.py` — pytest fixtures

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| Django | `django` in deps, `manage.py`, `settings.py`, `urls.py` |
| Flask | `flask` in deps, `app = Flask(__name__)`, blueprints |
| FastAPI | `fastapi` in deps, `app = FastAPI()`, `@app.get` decorators |
| Django REST Framework | `djangorestframework` in deps, serializers, viewsets |
| Celery workers | `celery` in deps, `tasks.py` files |
| CLI tool | `click` or `argparse` usage, `__main__.py` |

## Domain Signal Locations
- `models.py` or `models/` — domain entities and relationships
- `services/` or `logic/` — business rules and workflows
- `serializers.py` — data shape and validation rules (DRF)
- `schemas.py` — Pydantic models defining domain types (FastAPI)
- `enums.py` or `constants.py` — domain states and categories
- `signals.py` — domain events (Django)

## Convention Indicators
- `pyproject.toml` [tool.ruff] or `.flake8` — linting config
- `pyproject.toml` [tool.black] or `.black.toml` — formatting config
- `mypy.ini` or `pyproject.toml` [tool.mypy] — type checking config
- `.pre-commit-config.yaml` — pre-commit hooks
- `tox.ini` — test environment config

## What to Sample (priority order)
1. `requirements.txt` / `pyproject.toml` — dependencies, framework detection
2. Entry point (`app.py`, `main.py`, `manage.py`) — app setup, configuration
3. One model file — data structure, relationships, field types
4. One view/route file — API patterns, decorators, response format
5. One service file — business logic, error handling patterns
