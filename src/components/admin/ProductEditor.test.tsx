import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductEditor } from "./ProductEditor";

describe("ProductEditor", () => {
  it("edits price and approved descriptions without exposing identity, capacity, or MOQ controls", () => {
    render(
      <ProductEditor product={{
        id: "500ml", capacityMl: 500, usdPrice: "7.30", imagePath: "/images/products/product-500ml.webp",
        zhDescription: "中文说明", enDescription: "English description",
      }} />,
    );
    expect(screen.getByRole("heading", { name: "500 ml" })).toBeInTheDocument();
    expect(screen.getByLabelText("美元参考价 / Reference USD")).toHaveValue(7.3);
    expect(screen.getByLabelText("中文说明 / Chinese description")).toHaveValue("中文说明");
    expect(screen.queryByLabelText(/capacity/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/MOQ/i)).not.toBeInTheDocument();
  });
});
