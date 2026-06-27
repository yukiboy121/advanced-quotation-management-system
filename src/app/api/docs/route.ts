import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openapi: "3.0.3",
    info: {
      title: "Advanced Quotation Generator API",
      version: "1.0.0",
      description: "Enterprise quotation management REST API",
    },
    paths: {
      "/api/auth/login": { post: { summary: "Login with email and password" } },
      "/api/auth/register": { post: { summary: "Register a user" } },
      "/api/customers": { get: { summary: "List customers" }, post: { summary: "Create customer" } },
      "/api/products": { get: { summary: "List products" }, post: { summary: "Create product" } },
      "/api/quotations": { get: { summary: "List quotations" }, post: { summary: "Create quotation" } },
      "/api/reports/revenue": { get: { summary: "Revenue report" } },
      "/api/backup/export": { get: { summary: "Export backup" } },
      "/api/backup/restore": { post: { summary: "Restore backup" } },
    },
  });
}
