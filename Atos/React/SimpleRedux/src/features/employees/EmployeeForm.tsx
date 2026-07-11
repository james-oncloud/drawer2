import { FormEvent, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addEmployee } from './employeesSlice';
import type { Department } from '../../types/employee';

const defaultForm = {
  name: '',
  email: '',
  department: 'engineering' as Department,
  role: '',
  salary: '',
};

export function EmployeeForm() {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState(defaultForm);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const salary = Number(form.salary);
    if (!form.name.trim() || !form.email.trim() || !form.role.trim() || Number.isNaN(salary)) {
      return;
    }

    dispatch(
      addEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department,
        role: form.role.trim(),
        salary,
      }),
    );

    setForm(defaultForm);
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h2>Add employee</h2>

      <div className="form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Jane Doe"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="jane.doe@example.com"
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
            placeholder="Software Engineer"
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
            placeholder="60000"
            required
          />
        </label>
      </div>

      <button type="submit" className="btn-primary">
        Add to directory
      </button>
    </form>
  );
}
