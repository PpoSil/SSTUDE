import { LoginState } from "./types";
import axiosToken from "../../apis/http-common";
import { storageData } from "../../apis/JWT-common";
import { SIGN_UP_URL, SIGN_IN_URL } from "../../apis/constants";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const signUpUser = createAsyncThunk(
  "login/signUpUser",
  async (data: { deviceNum: string }, { rejectWithValue }) => {
    try {
      console.log("회원가입 처리 시작");
      const response = await axiosToken.post(SIGN_UP_URL, data);
      const memberId = response.data.memberId;
      return memberId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const signInUser = createAsyncThunk(
  "login/signInUser",
  async (data: { deviceNum: string }, { rejectWithValue }) => {
    try {
      console.log("로그인 처리 시작");
      const response = await axiosToken.post(SIGN_IN_URL, data);
      storageData(response.data.accessToken, (message) => {
        console.log("토큰 저장", message); 
      });
      const memberId = response.data.memberId;
      return memberId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  }
);


const initialState: LoginState = {
  userInfo: "",
  serialNum: "",
  signUp: false,
  signIn: false,
  memberId: "",
  gps: null,
};

export const LoginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    processMessage: (
      state: LoginState,
      action: PayloadAction<{
        type: "signUp" | "signIn" | "signOut";
        data: {
          userInfo: string;
          serialNum: string;
          gps: [number, number] | null;
        };
      }>
    ) => {
      const { type, data } = action.payload;
      if (type === "signUp") {
        state.userInfo = data.userInfo;
        state.serialNum = data.serialNum;
        state.signUp = true;
      } else if (type === "signIn") {
        state.userInfo = data.userInfo;
        state.serialNum = data.serialNum;
        // state.gps = data.gps;
        state.signIn = true;
      } else if (type === "signOut") {
        state.userInfo = "";
        state.serialNum = "";
        state.signUp = false;
        state.signIn = false;
        state.memberId = "";
      }
    },
    setMemberId: (state, action: PayloadAction<string>) => {
      state.memberId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.memberId = action.payload;
    });
    builder.addCase(signInUser.fulfilled, (state, action) => {
      state.memberId = action.payload;
    });
  },
});

export const { processMessage, setMemberId } = LoginSlice.actions;

export default LoginSlice.reducer;
