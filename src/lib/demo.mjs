export function parseStudyNotes(text) {
  return String(text).slice(0, 20000).split(/\r?\n/).flatMap(line => {
    const separator = line.indexOf(':');
    if (separator < 1) return [];
    const question = line.slice(0, separator).trim();
    const answer = line.slice(separator + 1).trim();
    return question && answer ? [{ question, answer }] : [];
  }).slice(0, 30);
}
