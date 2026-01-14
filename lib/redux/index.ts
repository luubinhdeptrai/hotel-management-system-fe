import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";

import roomTypeReducer from "./slices/room-type.slice";
import appSettingsReducer from "./slices/app-settings.slice";
import permissionReducer from "./slices/permission.slice";
import transactionReducer from "./slices/transaction.slice";
import bookingReducer from "./slices/booking.slice";
import employeeReducer from "./slices/employee.slice";
import customerReducer from "./slices/customer.slice";
import checkinReducer from "./slices/checkin.slice";

const logger = createLogger({
  collapsed: true,
});

export const store = configureStore({
  reducer: {
    roomType: roomTypeReducer,
    appSettings: appSettingsReducer,
    permission: permissionReducer,
    transaction: transactionReducer,
    booking: bookingReducer,
    employee: employeeReducer,
    customer: customerReducer,
    checkin: checkinReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabled due to potential non-serializable data in types (e.g. Dates inside objects if not serialized)
    }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
