import { FlowProvider } from "./flow-store";

export default function FlowLayout({ children }: LayoutProps<"/systems/flow">) {
  return <FlowProvider>{children}</FlowProvider>;
}
