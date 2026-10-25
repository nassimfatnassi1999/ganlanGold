import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VisitForm } from "./VisitForm";

describe("VisitForm", () => {
  afterEach(() => vi.restoreAllMocks());

  it("does not promise a date and shows the server reference after submission", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ requestId: "GGV-20261025-ABCDE", duplicate: false, notification: "sent" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    render(<VisitForm />);
    await waitFor(() => expect(screen.getByRole("button", { name: "提交考察申请" })).toBeEnabled());
    fireEvent.change(screen.getByLabelText("公司名称 / Company"), { target: { value: "Atlas Imports" } });
    fireEvent.change(screen.getByLabelText("联系人 / Contact person"), { target: { value: "Li Wei" } });
    fireEvent.change(screen.getByLabelText("国家或地区 / Country or region"), { target: { value: "中国" } });
    fireEvent.change(screen.getByLabelText("电子邮箱 / Email"), { target: { value: "buyer@example.com" } });
    fireEvent.change(screen.getByLabelText("期望考察日期或时间段 / Preferred date or period"), {
      target: { value: "2027 年春季" },
    });
    fireEvent.click(screen.getByLabelText(/我同意 GANLAN GOLD 使用以上信息处理本次考察申请/));
    fireEvent.click(screen.getByRole("button", { name: "提交考察申请" }));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("GGV-20261025-ABCDE");
    expect(status).toHaveTextContent("考察日期尚未确认");
  });
});
