function getLastHangulSyllable(value: string) {
  const chars = Array.from(value.trim()).reverse();
  return chars.find((char) => {
    const code = char.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3;
  });
}

export function topicParticle(value: string) {
  const lastHangul = getLastHangulSyllable(value);
  if (!lastHangul) return "은(는)";
  const code = lastHangul.charCodeAt(0);
  return (code - 0xac00) % 28 === 0 ? "는" : "은";
}

export function withTopicParticle(value: string) {
  return `${value}${topicParticle(value)}`;
}