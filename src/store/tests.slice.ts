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
// during submission (see attendTest/t/[testId]/page.tsx → onSubmit).
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

export const getTestsWithQuestionsAnswers = createAsyncThunk<
  any,
  { userId: string; testId: string },
  { rejectValue: any }
>(
  "/tests/getTestsWithQuestionsAnswers",
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await SupaClient.from("questions")
        .select("*,answers(answer,marks)")
        .eq("testsId", payload.testId)
        .eq("answers.userId", payload.userId);
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
  User: Pick<
    Database["public"]["Tables"]["User"]["Row"],
    "id" | "first_name" | "prof_image"
  >;
  questions: QuestionBrief[];
};

export type TestsAnswers = Database["public"]["Tables"]["questions"]["Row"] & {
  answers: Pick<Database["public"]["Tables"]["answers"]["Row"], "answer" | "marks">[];
};

const TestsAdapter = createEntityAdapter<Tests>({
  selectId: (test) => test.id,
});

const TestsAnswersAdapter = createEntityAdapter<TestsAnswers>({
  selectId: (test) => test.id,
});

export const TestsSlice = createSlice({
  name: "tests",
  initialState: {
    tests: TestsAdapter.getInitialState({
      isPending: false,
    }),
    answers: TestsAnswersAdapter.getInitialState({
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
      .addCase(getTestsWithQuestionsAnswers.pending, (state) => {
        state.answers.isPending = true;
      })
      .addCase(getTestsWithQuestionsAnswers.fulfilled, (state, action) => {
        state.answers.isPending = false;
        TestsAnswersAdapter.setAll(state.answers, action.payload);
      });
  },
});

export const TestsSelector = TestsAdapter.getSelectors<RootState>(
  (state) => state.tests.tests
);

export const TestsAnswersSelector = TestsAnswersAdapter.getSelectors<RootState>(
  (state) => state.tests.answers
);
