import { FormEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateEmployee } from './employeesSlice';
import { selectSelectedEmployee } from './employeesSelectors';
import type { Department } from '../../types/employee';

export function EmployeeDetail() {
  const dispatch = useAppDispatch();
  const employee = useAppSelector(selectSelectedEmployee);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'engineering' as Department,
    role: '',
    salary: '',
  });

  useEffect(() => {
    if (!employee) return;

    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      salary: String(employee.salary),
    });
  }, [employee]);

  if (!employee) {
    return (
      <section className="employee-detail">
        <h2>Employee detail</h2>
        <p className="empty-state">Select an employee to view and edit their profile.</p>
      </section>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employee) return;

    const salary = Number(form.salary);
    if (Number.isNaN(salary)) return;

    dispatch(
      updateEmployee({
        id: employee.id,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department,
        role: form.role.trim(),
        salary,
      }),
    );
  }

  return (
    <section className="employee-detail">
      <h2>Employee detail</h2>
      <p className="detail-id">ID: {employee.id}</p>

      <form className="detail-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Department
          <select
            value={form.department}
            onChange={(event) =>
              setForm({ ...form, department: event.target.value as Department })
            }
          >
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="hr">HR</option>
            <option value="sales">Sales</option>
          </select>
        </label>

        <label>
          Role
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            required
          />
        </label>

        <label>
          Salary
          <input
            type="number"
            min="0"
            step="1000"
            value={form.salary}
            onChange={(event) => setForm({ ...form, salary: event.target.value })}
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          Save changes
        </button>
      </form>
    </section>
  );
}
