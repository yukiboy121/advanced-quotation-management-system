import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Advanced Quotation Generator",
    short_name: "QuoteSuite",
    description: "Enterprise quotation management SaaS",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4f46e5",
    icons: [],
  };
}
