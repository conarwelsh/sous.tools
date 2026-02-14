"use client";

import { useState } from "react";

export const useBilling = () => {
  const [loading] = useState(false);
  return { loading };
};
