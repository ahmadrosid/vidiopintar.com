"use client";

import { Ascii } from "ascii.rest/react";
import { deepReef } from "ascii.rest/pieces";

export function DeepReef() {
  return (
    <Ascii
      piece={deepReef}
      label="Animasi ASCII terumbu karang di bawah laut"
      className="block w-full"
    />
  );
}
