import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented(state) {
      state.value += 1
    },
    decremented(state) {
      state.value -= 1
    },
    incrementedByAmount(state, action) {
      state.value += action.payload
    },
    reset(state) {
      state.value = 0
    },
  },
})

export const { incremented, decremented, incrementedByAmount, reset } =
  counterSlice.actions

export default counterSlice.reducer
