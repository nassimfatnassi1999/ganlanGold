import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["NEW", "新请求"], ["CONTACTED", "已联系"], ["IN_NEGOTIATION", "洽谈中"],
    ["QUOTED", "已报价"], ["SCHEDULED", "已安排"], ["COMPLETED", "已完成"],
    ["CLOSED", "已关闭"], ["DECLINED", "未接受"],
  ])("renders %s as %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toHaveAttribute("data-status", status);
  });
});
