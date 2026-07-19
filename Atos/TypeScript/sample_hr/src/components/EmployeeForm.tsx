import { useId, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import type { CreateEmployeeInput, Department } from '../types/hr';
import { DEPARTMENTS } from '../types/hr';

type EmployeeFormProps = {
  onSubmit: (input: CreateEmployeeInput) => Promise<unknown>;
  disabled?: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  title: string;
  startDate: string;
};

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  department: DEPARTMENTS.Engineering,
  title: '',
  startDate: new Date().toISOString().slice(0, 10),
};

export function EmployeeForm({ onSubmit, disabled = false }: EmployeeFormProps) {
  const formId = useId();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const onFieldChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required');
      firstNameRef.current?.focus();
      return;
    }

    const input: CreateEmployeeInput = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      department: form.department,
      title: form.title || 'Team Member',
      startDate: form.startDate,
    };

    await onSubmit(input);
    setForm(EMPTY_FORM);
    firstNameRef.current?.focus();
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit} noValidate>
      <h2>Add employee</h2>

      <div className="form-grid">
        <label className="field" htmlFor={`${formId}-first`}>
          <span>First name</span>
          <input
            id={`${formId}-first`}
            ref={firstNameRef}
            value={form.firstName}
            onChange={onFieldChange('firstName')}
            autoComplete="given-name"
            required
          />
        </label>

        <label className="field" htmlFor={`${formId}-last`}>
          <span>Last name</span>
          <input
            id={`${formId}-last`}
            value={form.lastName}
            onChange={onFieldChange('lastName')}
            autoComplete="family-name"
            required
          />
        </label>

        <label className="field" htmlFor={`${formId}-email`}>
          <span>Email</span>
          <input
            id={`${formId}-email`}
            type="email"
            value={form.email}
            onChange={onFieldChange('email')}
            autoComplete="email"
            required
          />
        </label>

        <label className="field" htmlFor={`${formId}-title`}>
          <span>Title</span>
          <input
            id={`${formId}-title`}
            value={form.title}
            onChange={onFieldChange('title')}
            placeholder="Software Engineer"
          />
        </label>

        <label className="field" htmlFor={`${formId}-dept`}>
          <span>Department</span>
          <select
            id={`${formId}-dept`}
            value={form.department}
            onChange={onFieldChange('department')}
          >
            {(Object.values(DEPARTMENTS) as Department[]).map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor={`${formId}-start`}>
          <span>Start date</span>
          <input
            id={`${formId}-start`}
            type="date"
            value={form.startDate}
            onChange={onFieldChange('startDate')}
          />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" disabled={disabled}>
        {disabled ? 'Saving…' : 'Add employee'}
      </button>
    </form>
  );
}
