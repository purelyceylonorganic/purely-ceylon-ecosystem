import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // டைப்-ஒன்லி இம்போர்ட்

interface CommerceState {
  isOnline: boolean;
  offlineOrderQueue: any[];
  userToken: string | null;
  currentUser: any | null;
}

const initialState: CommerceState = {
  isOnline: navigator.onLine,
  offlineOrderQueue: [],
  userToken: localStorage.getItem("pco_token"),
  currentUser: null,
};

export const commerceSlice = createSlice({
  name: "commerce",
  initialState,
  reducers: {
    setNetworkStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.userToken = action.payload.token;
      state.currentUser = action.payload.user;
      localStorage.setItem("pco_token", action.payload.token);
    },
    logout: (state) => {
      state.userToken = null;
      state.currentUser = null;
      localStorage.removeItem("pco_token");
    },
    addOrderToOfflineQueue: (state, action: PayloadAction<any>) => {
      state.offlineOrderQueue.push(action.payload);
    },
    clearOfflineQueue: (state) => {
      state.offlineOrderQueue = [];
    },
  },
});

export const { setNetworkStatus, setAuth, logout, addOrderToOfflineQueue, clearOfflineQueue } = commerceSlice.actions;
export default commerceSlice.reducer;