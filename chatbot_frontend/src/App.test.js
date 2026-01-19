import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders chat header", () => {
  render(<App />);
  expect(screen.getByText(/Chat/i)).toBeInTheDocument();
  expect(screen.getByText(/Client-side transcript/i)).toBeInTheDocument();
});
