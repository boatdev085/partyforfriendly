"use client";

import dynamic from "next/dynamic";

const DevUserSwitcher = dynamic(
  () => import("@/components/dev/DevUserSwitcher"),
  { ssr: false }
);

export default function DevUserSwitcherLoader() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevUserSwitcher />;
}
