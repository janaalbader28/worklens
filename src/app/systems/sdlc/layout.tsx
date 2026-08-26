import { SdlcProvider } from "./sdlc-store";

export default function SdlcLayout({ children }: LayoutProps<"/systems/sdlc">) {
  return <SdlcProvider>{children}</SdlcProvider>;
}
