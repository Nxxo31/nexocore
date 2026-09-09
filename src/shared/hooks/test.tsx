// Test file - simple component

"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

interface TestContextValue {
  test: string;
}

const TestContext = createContext<TestContextValue>({
  test: "hello",
});

export function TestProvider({ children }: { children: ReactNode }) {
  const value = useMemo<TestContextValue>(() => {
    return {
      test: "hello",
    };
  }, []);

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  return useContext(TestContext);
}