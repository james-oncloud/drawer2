import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CreateEmployeePayload,
  DepartmentFilter,
  Employee,
  UpdateEmployeePayload,
} from '../../types/employee';

interface EmployeesState {
  items: Employee[];
  selectedId: string | null;
  departmentFilter: DepartmentFilter;
}

const seedEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    department: 'engineering',
    role: 'Senior Developer',
    salary: 72000,
    isActive: true,
  },
  {
    id: 'emp-2',
    name: 'Sam Patel',
    email: 'sam.patel@example.com',
    department: 'design',
    role: 'Product Designer',
    salary: 65000,
    isActive: true,
  },
  {
    id: 'emp-3',
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    department: 'hr',
    role: 'People Partner',
    salary: 58000,
    isActive: false,
  },
];

const initialState: EmployeesState = {
  items: seedEmployees,
  selectedId: seedEmployees[0]?.id ?? null,
  departmentFilter: 'all',
};

let nextId = seedEmployees.length + 1;

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee(state, action: PayloadAction<CreateEmployeePayload>) {
      const employee: Employee = {
        id: `emp-${nextId++}`,
        isActive: true,
        ...action.payload,
      };
      state.items.push(employee);
      state.selectedId = employee.id;
    },
    updateEmployee(state, action: PayloadAction<UpdateEmployeePayload>) {
      const employee = state.items.find((item) => item.id === action.payload.id);
      if (!employee) return;
      Object.assign(employee, action.payload);
    },
    removeEmployee(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = state.items[0]?.id ?? null;
      }
    },
    selectEmployee(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    toggleEmployeeActive(state, action: PayloadAction<string>) {
      const employee = state.items.find((item) => item.id === action.payload);
      if (employee) {
        employee.isActive = !employee.isActive;
      }
    },
    setDepartmentFilter(state, action: PayloadAction<DepartmentFilter>) {
      state.departmentFilter = action.payload;
    },
  },
});

export const {
  addEmployee,
  updateEmployee,
  removeEmployee,
  selectEmployee,
  toggleEmployeeActive,
  setDepartmentFilter,
} = employeesSlice.actions;

export default employeesSlice.reducer;
