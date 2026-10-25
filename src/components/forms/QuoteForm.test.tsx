import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PRODUCT_SPECS } from "@/lib/products/catalog";
import { QuoteForm } from "./QuoteForm";

describe("QuoteForm", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows accessible client validation without submitting an empty form", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<QuoteForm products={PRODUCT_SPECS} />);
    const submit = screen.getByRole("button", { name: "提交询价" });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("请检查以下内容");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits structured quantities and presents the returned request reference", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ requestId: "GGQ-20261025-ABCDE", duplicate: false, notification: "not-configured" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    render(<QuoteForm products={PRODUCT_SPECS} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "提交询价" })).toBeEnabled());
    fireEvent.change(screen.getByLabelText("公司名称 / Company name"), { target: { value: "Atlas Imports" } });
    fireEvent.change(screen.getByLabelText("国家或地区 / Country or region"), { target: { value: "中国" } });
    fireEvent.change(screen.getByLabelText("联系人 / Contact person"), { target: { value: "Li Wei" } });
    fireEvent.change(screen.getByLabelText("电子邮箱 / Email"), { target: { value: "buyer@example.com" } });
    fireEvent.change(screen.getByLabelText("目的港 / Destination port"), { target: { value: "Nansha" } });
    fireEvent.click(screen.getByLabelText("选择 500 ml"));
    fireEvent.change(screen.getByLabelText("500 ml 包装数量"), { target: { value: "15000" } });
    fireEvent.click(screen.getByLabelText(/我同意 GANLAN GOLD 使用以上信息处理本次询价/));
    fireEvent.click(screen.getByRole("button", { name: "提交询价" }));

    expect(await screen.findByText(/GGQ-20261025-ABCDE/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/quotes",
      expect.objectContaining({ method: "POST", headers: { "content-type": "application/json" } }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body));
    expect(body.products).toEqual([{ productId: "500ml", quantity: 15000 }]);
    expect(body.consent).toBe(true);
  });
});
