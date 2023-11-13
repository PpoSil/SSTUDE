import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../components/Login/LoginSlice";
import BusReducer from "../components/Bus/BusSlice";
import MirrorReducer from "../components/Main/MirrorSlice";
import HealthReducer from "../components/Health/HealthSlice";
import CaptureReducer from "../components/Personal/Capture/CaptureSlice";
import WeatherReducer from './WeatherSlice'
import AirQuality from "./AirQualitySlice";
import PersonalReducer from "../components/Personal/Main/PersonalSlice";
import PreviousReducer from "../components/Personal/Previous/PreviousSlice";


const store = configureStore({
  reducer: {
    login: loginReducer,
    bus: BusReducer,
    mirror: MirrorReducer,
    health: HealthReducer,
    capture: CaptureReducer,
    weather: WeatherReducer,
    airQuality: AirQuality,
    personal: PersonalReducer,
    previous: PreviousReducer,
  },
});

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
