import { createRoot } from "react-dom/client";

import { Container } from "./components/container";

const container = document.getElementById("game");
const root = createRoot(container!);

root.render(<Container />);
