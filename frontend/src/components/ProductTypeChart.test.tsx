import React from "react";
import { render, screen } from "@testing-library/react";
import ProductTypeChart from "./ProductTypeChart";

const products = [
  { type: "Монитор" },
  { type: "Монитор" },
  { type: "Клавиатура" },
];

describe("ProductTypeChart", () => {
  it("renders bar chart with correct type counts (smoke)", () => {
    const { container } = render(<ProductTypeChart products={products} />);
    expect(
      container.querySelector(".recharts-responsive-container")
    ).toBeInTheDocument();
  });

  it("shows 'Нет данных для графика' if no products", () => {
    render(<ProductTypeChart products={[]} />);
    expect(screen.getByText(/нет данных/i)).toBeInTheDocument();
  });
});
