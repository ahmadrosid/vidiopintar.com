"use client";

import { Ascii } from "ascii.rest/react";
import { kyotoDusk } from "ascii.rest/pieces";

export function KyotoDusk() {
  return (
    <Ascii
      piece={kyotoDusk}
      label="Animasi ASCII senja di Kyoto"
      className="block w-full"
    />
  );
}
