import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

/** Typed dispatch — use this instead of plain `useDispatch` */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector — use this instead of plain `useSelector` */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);
