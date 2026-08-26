import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EmployeesProvider } from "@/store/employees-store";
import { TicketsProvider } from "@/store/tickets-store";
import { WorkLogProvider } from "@/store/work-log-store";
import { HandoverRequestsProvider } from "@/store/handover-requests-store";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkLens | All tasks in sight.",
  description:
    "WorkLens connects FLOW, the IT Ticket System, HR and SDLC to answer: who is available, who has the right skills, and what happens if we assign new work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-page text-ink">
        <EmployeesProvider>
          <TicketsProvider>
            <WorkLogProvider>
              <HandoverRequestsProvider>{children}</HandoverRequestsProvider>
            </WorkLogProvider>
          </TicketsProvider>
        </EmployeesProvider>
      </body>
    </html>
  );
}
