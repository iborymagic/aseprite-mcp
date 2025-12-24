export function successResult(tool: string, result: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          tool,
          result,
        }, null, 2)
      }
    ]
  };
}

export function errorResult(tool: string, error: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          success: false,
          tool,
          error,
        }, null, 2)
      }
    ]
  };
}