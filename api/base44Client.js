export const base44 = {
  integrations: {
    Core: {
      async InvokeLLM({ prompt }) {
        return `AI Antwort: ${prompt.slice(0, 80)}...`;
      }
    }
  }
};
