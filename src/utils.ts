export function readLine(input: any, prompt = "") {
  return new Promise<string | null>((rsov) => {
    input.question(prompt, (line: string | null) => rsov(line));
  });
}
