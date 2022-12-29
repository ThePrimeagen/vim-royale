import React from "react";
import { createRoot } from "react-dom/client";
import { VimRoyale } from "./container";

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<VimRoyale />);
