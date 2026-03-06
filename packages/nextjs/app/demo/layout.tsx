import { DemoProvider } from "./_context/DemoContext";

export const metadata = {
  title: "City/Sync Demo",
  description: "Explore the City/Sync civic participation protocol — choose a role and try it live.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
