import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  id: string;
  email: string;
  name: string;
  role: "STAFF" | "STUDENT" | undefined;
}

const initialState: AuthState = {
  id: "",
  email: "",
  name: "",
  role: undefined,
};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, { payload }: PayloadAction<AuthState>) {
      state.id = payload.id;
      state.email = payload.email;
      state.name = payload.name;
      state.role = payload.role;
    },
    clearUser(state) {
      state.id = "";
      state.email = "";
      state.name = "";
      state.role = undefined;
    },
  },
});

export const { setUser, clearUser } = auth.actions;
export default auth;
