import type { ReactNode } from "react";

export const metadata = {
  title: "Internal · Agent Reasoning Logs",
  robots: { index: false, follow: false },
};

export default function InternalLogsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
