import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  removeEmployee,
  selectEmployee,
  toggleEmployeeActive,
} from './employeesSlice';
import {
  selectFilteredEmployees,
  selectSelectedEmployeeId,
} from './employeesSelectors';

const departmentLabels: Record<string, string> = {
  engineering: 'Engineering',
  design: 'Design',
  hr: 'HR',
  sales: 'Sales',
};

export function EmployeeList() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(selectFilteredEmployees);
  const selectedId = useAppSelector(selectSelectedEmployeeId);

  if (employees.length === 0) {
    return <p className="empty-state">No employees match this filter.</p>;
  }

  return (
    <ul className="employee-list">
      {employees.map((employee) => (
        <li
          key={employee.id}
          className={`employee-card ${employee.id === selectedId ? 'selected' : ''}`}
        >
          <button
            type="button"
            className="employee-select"
            onClick={() => dispatch(selectEmployee(employee.id))}
          >
            <span className="employee-name">{employee.name}</span>
            <span className="employee-meta">
              {departmentLabels[employee.department]} · {employee.role}
            </span>
            <span className={`badge ${employee.isActive ? 'active' : 'inactive'}`}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span>
          </button>

          <div className="employee-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => dispatch(toggleEmployeeActive(employee.id))}
            >
              {employee.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => dispatch(removeEmployee(employee.id))}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
