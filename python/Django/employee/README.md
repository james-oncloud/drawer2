# Employee Django Project

This is a simple Django employee management app with:

- Create employee
- Edit employee
- Delete employee
- List all employees
- Search employees (name, email, position, department)

## Run locally

```bash
cd /Users/jamesking/work/drawer2/python/Django/employee
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open: <http://127.0.0.1:8000/>

## Project structure and file purpose

```text
employee/
├── manage.py
├── requirements.txt
├── README.md
├── employee_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── employees/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py
└── templates/
    ├── base.html
    └── employees/
        ├── employee_list.html
        ├── employee_form.html
        └── employee_confirm_delete.html
```

### Root files

- `manage.py`: Django command-line entry point (`runserver`, `migrate`, etc.).
- `requirements.txt`: Python dependencies for this project (Django).
- `README.md`: Setup guide and project documentation.

### `employee_project/` (project config package)

- `employee_project/__init__.py`: Marks this folder as a Python package.
- `employee_project/settings.py`: Global Django settings (apps, templates, database, middleware).
- `employee_project/urls.py`: Top-level URL routing; includes app routes and admin.
- `employee_project/asgi.py`: ASGI app entry point (async servers/deployments).
- `employee_project/wsgi.py`: WSGI app entry point (traditional web servers/deployments).

### `employees/` (business app)

- `employees/__init__.py`: Marks this folder as a Python package.
- `employees/apps.py`: App configuration class (`EmployeesConfig`).
- `employees/models.py`: Database models; contains the `Employee` model.
- `employees/forms.py`: Form classes; contains `EmployeeForm` for create/edit validation and rendering.
- `employees/views.py`: Request handlers for list, create, update, delete, and search.
- `employees/urls.py`: App-level routes mapped to employee views.
- `employees/admin.py`: Admin site configuration for managing `Employee` records.
- `employees/migrations/__init__.py`: Marks migrations folder as a package.
- `employees/migrations/0001_initial.py`: Initial database schema migration for `Employee`.

### `templates/` (HTML templates)

- `templates/base.html`: Shared base layout and basic styling.
- `templates/employees/employee_list.html`: Employee table view with search input and action buttons.
- `templates/employees/employee_form.html`: Shared create/edit form page.
- `templates/employees/employee_confirm_delete.html`: Delete confirmation page.

## Django template guide (DTL)

This project uses Django Template Language (DTL) in all HTML files.

### 1) Template inheritance

Use a base template for shared layout and extend it in page templates.

```django
{% extends "base.html" %}
{% block content %}
<h2>Page Content</h2>
{% endblock %}
```

### 2) Variables

Render values from context using `{{ ... }}`.

```django
{{ employee.first_name }} {{ employee.last_name }}
{{ employee.email }}
```

### 3) Tags (logic in templates)

Use tags for loops, conditions, and CSRF tokens in forms.

```django
{% for employee in employees %}
  {{ employee.first_name }}
{% empty %}
  No employees found.
{% endfor %}
```

```django
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
</form>
```

### 4) Filters

Use filters to format or provide fallbacks.

```django
{{ employee.department|default:"-" }}
{{ employee.date_hired|default:"-" }}
```

### 5) URL reversing

Generate URLs by route name instead of hardcoding paths.

```django
<a href="{% url 'employee_create' %}">Add Employee</a>
<a href="{% url 'employee_update' employee.pk %}">Edit</a>
<a href="{% url 'employee_delete' employee.pk %}">Delete</a>
```

### 6) Search form pattern used in this project

The employee list uses a `GET` form with query parameter `q`.

```django
<form method="get">
  <input type="text" name="q" value="{{ query }}" placeholder="Search...">
  <button type="submit">Search</button>
</form>
```

## How a request is processed

This section explains how Django handles an HTTP request in this project.

### High-level flow

1. Browser sends request (for example `GET /` or `POST /employees/new/`).
2. Django matches the URL in `employee_project/urls.py` and `employees/urls.py`.
3. Matched view function in `employees/views.py` runs.
4. View reads data from:
   - `request.GET` for search query (`q`)
   - `request.POST` for submitted form fields
   - database via `Employee` model (`employees/models.py`)
5. View either:
   - renders a template (`render(...)`) for HTML response, or
   - redirects (`redirect(...)`) after successful create/update/delete.
6. Django returns the final HTTP response to the browser.

### URL routing in this project

- `employee_project/urls.py` includes the app routes from `employees/urls.py`.
- `employees/urls.py` maps:
  - `/` -> `employee_list`
  - `/employees/new/` -> `employee_create`
  - `/employees/<id>/edit/` -> `employee_update`
  - `/employees/<id>/delete/` -> `employee_delete`

### Example A: List + search request (`GET /?q=john`)

1. URL `/` is routed to `employee_list`.
2. `employee_list` gets `q` from `request.GET`.
3. It queries `Employee.objects.all()` and applies filters when `q` is present.
4. It renders `templates/employees/employee_list.html` with context:
   - `employees` (filtered rows)
   - `query` (current search text)
5. Template loops over employees and returns HTML table to browser.

### Example B: Create request (`POST /employees/new/`)

1. URL `/employees/new/` is routed to `employee_create`.
2. View builds `EmployeeForm(request.POST)`.
3. If valid, `form.save()` creates a row in database.
4. View redirects to `employee_list` (PRG pattern: Post/Redirect/Get).
5. Browser performs `GET /` and shows updated list.

### Example C: Update request (`POST /employees/<id>/edit/`)

1. URL is routed to `employee_update`.
2. View fetches record with `get_object_or_404(Employee, pk=id)`.
3. Form binds posted data to existing instance.
4. If valid, it saves changes and redirects to list page.

### Example D: Delete request (`POST /employees/<id>/delete/`)

1. URL is routed to `employee_delete`.
2. GET request first shows confirm page (`employee_confirm_delete.html`).
3. POST request deletes the selected employee.
4. View redirects to list page.

### Files involved in request processing

- `employee_project/urls.py`: Entry point for URL matching.
- `employees/urls.py`: Route-to-view mapping.
- `employees/views.py`: Main request handling logic.
- `employees/forms.py`: Validation and form-to-model binding.
- `employees/models.py`: Database structure and ORM access.
- `templates/...`: Final HTML rendering.
