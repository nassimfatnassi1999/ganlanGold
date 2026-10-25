import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PRODUCT_SPECS } from "@/lib/products/catalog";
import { PublicExperience } from "./PublicExperience";

const products = PRODUCT_SPECS.map((product) => ({
  ...product,
  zhDescription: `中文 ${product.id}`,
  enDescription: `English ${product.id}`,
}));

describe("public experience", () => {
  it("renders a Chinese-first semantic page and exactly four product formats", () => {
    render(
      <PublicExperience
        products={products}
        rate={{ status: "available", usdCny: "7.00000000", referenceDate: "2026-10-23", source: "fresh" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeInTheDocument();
    const productSection = screen.getByRole("region", { name: "产品系列" });
    for (const capacity of ["250 ml", "500 ml", "750 ml", "5 L"]) {
      expect(within(productSection).getByRole("heading", { name: capacity })).toBeInTheDocument();
    }
    expect(within(productSection).getAllByText(/人民币参考价/)).toHaveLength(4);
    expect(within(productSection).getByText("¥28")).toBeInTheDocument();
    expect(within(productSection).getByText("¥270")).toBeInTheDocument();
    expect(within(productSection).getByText("适用于专业客户")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/€|EUR/);
  });

  it("keeps the numeric global MOQ inside the dedicated wholesale section only", () => {
    render(<PublicExperience products={products} rate={{ status: "unavailable" }} />);
    const wholesale = screen.getByRole("region", { name: "批发订购" });
    expect(within(wholesale).getAllByText(/7,500/)).toHaveLength(2);
    const outside = document.body.textContent!.replace(wholesale.textContent!, "");
    expect(outside).not.toContain("7,500");
    expect(document.body.textContent).not.toContain("1,000 bottles");
  });

  it("renders contacts in the required order with exact working links and QR assignments", () => {
    render(<PublicExperience products={products} rate={{ status: "unavailable" }} />);
    const contacts = screen.getByRole("region", { name: "联系我们" });
    const names = within(contacts).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(names).toEqual(["Gisèle", "Lassad", "Fouad"]);
    expect(within(contacts).getByRole("link", { name: /\+86 134 2751 3756/ })).toHaveAttribute(
      "href",
      "tel:+8613427513756",
    );
    expect(within(contacts).getByRole("link", { name: /\+33 6 34 14 26 32/ })).toHaveAttribute(
      "href",
      "https://wa.me/33634142632",
    );
    expect(within(contacts).getByRole("link", { name: /\+40 724 815 229/ })).toHaveAttribute(
      "href",
      "https://wa.me/40724815229",
    );
    expect(within(contacts).queryByAltText(/Gisèle.*二维码/)).not.toBeInTheDocument();
    expect(within(contacts).getByAltText("Lassad 微信二维码")).toHaveAttribute("src", expect.stringContaining("lassad"));
    expect(within(contacts).getByAltText("Fouad 微信二维码")).toHaveAttribute("src", expect.stringContaining("fouad"));
  });
});
