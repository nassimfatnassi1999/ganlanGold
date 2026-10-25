import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "./AdminShell";

describe("AdminShell", () => {
  it("identifies the authenticated operator and exposes every administration area", () => {
    render(<AdminShell email="operator@example.com" logoutAction={vi.fn()}><p>Dashboard</p></AdminShell>);
    expect(screen.getAllByText("operator@example.com")).toHaveLength(2);
    for (const [name, href] of [
      ["概览", "/admin"], ["产品", "/admin/products"], ["询价", "/admin/quotes"],
      ["考察", "/admin/visits"], ["汇率", "/admin/rates"], ["设置", "/admin/settings"],
    ]) {
      expect(screen.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
    }
    expect(screen.getByRole("button", { name: /退出/ })).toBeInTheDocument();
  });
});
