from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .forms import EmployeeForm
from .models import Employee


def employee_list(request):
    query = request.GET.get("q", "").strip()
    employees = Employee.objects.all()
    if query:
        employees = employees.filter(
            Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(email__icontains=query)
            | Q(position__icontains=query)
            | Q(department__icontains=query)
        )
    return render(
        request,
        "employees/employee_list.html",
        {"employees": employees, "query": query},
    )


def employee_create(request):
    if request.method == "POST":
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("employee_list")
    else:
        form = EmployeeForm()
    return render(request, "employees/employee_form.html", {"form": form, "title": "Add Employee"})


def employee_update(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    if request.method == "POST":
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            return redirect("employee_list")
    else:
        form = EmployeeForm(instance=employee)
    return render(request, "employees/employee_form.html", {"form": form, "title": "Edit Employee"})


def employee_delete(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    if request.method == "POST":
        employee.delete()
        return redirect("employee_list")
    return render(request, "employees/employee_confirm_delete.html", {"employee": employee})
