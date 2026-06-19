import { defineTool } from "eve/tools";
import { z } from "zod";

// A trivial local tool to show the `tools/` directory convention. The filename
// (`echo`) becomes the tool name the model sees. Most real tools will come from
// the skillfish MCP gateway (see ../connections/skillfish.ts) rather than here.
export default defineTool({
  description: "Echo a message back to the caller. Replace with your own tools.",
  inputSchema: z.object({
    message: z.string(),
  }),
  async execute({ message }) {
    return { message };
  },
});
