import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import { Database } from "../../types/supabase";
import { SupaClient } from "@/utils/supabase";

// Intentionally omits the `answer` field — correct answers must not be sent
// to the client while a test is in progress. The answer is verified server-side
// during submission (see /api/tests/submit).
export const getTestsWithQuestions = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>(
  "/tests/getTestsWithQuestions",
  async (_payload, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await SupaClient.from("tests").select(
        "*,User(id,first_name,prof_image),questions(id,question,choices,testsId)"
      );
      if (response.error) return rejectWithValue(response.error);
      return fulfillWithValue(response.data);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// Questions as stored in the Redux tests adapter (answer field excluded).
export type QuestionBrief = {
  id: string;
  question: string;
  choices: string[];
  testsId: string | null;
};

export type Tests = Database["public"]["Tables"]["tests"]["Row"] & {
  duration_minutes?: number | null;
  instructions?: string | null;
  User: Pick<
    Database["public"]["Tables"]["User"]["Row"],
    "id" | "first_name" | "prof_image"
  >;
  questions: QuestionBrief[];
};

const TestsAdapter = createEntityAdapter<Tests>({
  selectId: (test) => test.id,
});

export const TestsSlice = createSlice({
  name: "tests",
  initialState: {
    tests: TestsAdapter.getInitialState({
      isPending: false,
    }),
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getTestsWithQuestions.pending, (state) => {
        state.tests.isPending = true;
      })
      .addCase(getTestsWithQuestions.fulfilled, (state, action) => {
        state.tests.isPending = false;
        TestsAdapter.setAll(state.tests, action.payload);
      })
      .addCase(getTestsWithQuestions.rejected, (state) => {
        state.tests.isPending = false;
      });
  },
});

export const TestsSelector = TestsAdapter.getSelectors<RootState>(
  (state) => state.tests.tests
);
