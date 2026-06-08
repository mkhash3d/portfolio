import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
// const branch =
//   process.env.GITHUB_BRANCH ||
//   process.env.VERCEL_GIT_COMMIT_REF ||
//   process.env.HEAD ||
//   "main";
const branch = "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

build: {
  outputFolder: "admin",
  publicFolder: "public"
},
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "projects",
        label: "Projects",
        path: "src/content/projects",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "image", name: "coverImage", label: "Cover image" },
          { type: "string", name: "tools", label: "Tools used", list: true },
          { type: "string", name: "medium", label: "Medium", options: ["installation","generative","interactive","video","performance","research"] },
          { type: "string", name: "type", label: "Type", options: ["personal","commission","collaboration","research"] },
          { type: "datetime", name: "date", label: "Date" },
          { type: "boolean", name: "featured", label: "Featured on homepage" },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },
      {
        name: "writing",
        label: "Writing",
        path: "src/content/writing",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "description", label: "Summary", ui: { component: "textarea" } },
          { type: "datetime", name: "date", label: "Date" },
          { type: "string", name: "type", label: "Type", options: ["research","tutorial","process","notes"] },
          { type: "image", name: "coverImage", label: "Cover image" },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },
    ],
  },
});
