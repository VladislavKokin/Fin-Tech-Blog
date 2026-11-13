import { useCallback } from "react"
import { server } from "../../shared/api/index.js";

export const useServerRequest = () => {
  return useCallback((operation, ...params) => server[operation](...params), []);
};
