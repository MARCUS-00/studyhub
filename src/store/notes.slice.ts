import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import { Database } from "../../types/supabase";
import { SupaClient } from "@/utils/supabase";

export const getNotes = createAsyncThunk<any, void, { rejectValue: any }>(
  "/notes/getNotes",
  async (_payload, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await SupaClient.from("notes")
        .select("*,User(id,first_name,prof_image),subjects(sub_code,sub_name)")
        .order("uploaded_date", { ascending: false });
      if (response.error) return rejectWithValue(response.error);
      return fulfillWithValue(response.data);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// postNotes DB insert removed — notes are now created via POST /api/notes/create
// after the client uploads the PDF to Supabase Storage. This export is kept for
// backwards compatibility but is no longer dispatched by any page.
export const postNotes = createAsyncThunk<any, Record<string, never>, { rejectValue: any }>(
  "/notes/postNotes",
  async (_payload, { fulfillWithValue }) => fulfillWithValue(true)
);

export type Notes = Database["public"]["Tables"]["notes"]["Row"] & {
  User: Pick<
    Database["public"]["Tables"]["User"]["Row"],
    "id" | "first_name" | "prof_image"
  >;
  subjects: Pick<
    Database["public"]["Tables"]["subjects"]["Row"],
    "sub_code" | "sub_name"
  >;
};

const NotesAdapter = createEntityAdapter<Notes>({
  selectId: (notes) => notes.id,
});

export const NotesSlice = createSlice({
  name: "notes",
  initialState: NotesAdapter.getInitialState({
    isPending: false,
    isError: false,
    errorMessage: "",
  }),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getNotes.pending, (state) => {
        state.isPending = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isPending = false;
        NotesAdapter.setAll(state, action.payload);
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isPending = false;
        state.isError = true;
        state.errorMessage =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load notes.";
      });
  },
});

export const NotesSelector = NotesAdapter.getSelectors<RootState>(
  (state) => state.notes
);
