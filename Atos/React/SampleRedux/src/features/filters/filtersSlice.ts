import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PriorityFilter, StatusFilter } from '../../types';

interface FiltersState {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  showOverdueOnly: boolean;
}

const initialState: FiltersState = {
  search: '',
  status: 'all',
  priority: 'all',
  showOverdueOnly: false,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<StatusFilter>) {
      state.status = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<PriorityFilter>) {
      state.priority = action.payload;
    },
    toggleOverdueOnly(state) {
      state.showOverdueOnly = !state.showOverdueOnly;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  toggleOverdueOnly,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
