import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number; // ms per character
  lineDelay?: number; // ms between lines
}

export default function TypingText({ text, speed = 40, lineDelay = 500 }: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let isCancelled = false;
    let lines = text.split("\n");
    let currentLine = 0;
    let currentText = "";

    function typeLine() {
      if (isCancelled || currentLine >= lines.length) return;
      let line = lines[currentLine];
      let j = 0;
      function typeChar() {
        if (isCancelled) return;
        if (j <= line.length) {
          setDisplayed(prev => prev + (line[j - 1] || ""));
          j++;
          setTimeout(typeChar, speed);
        } else {
          setDisplayed(prev => prev + "\n");
          currentLine++;
          setTimeout(typeLine, lineDelay);
        }
      }
      typeChar();
    }
    setDisplayed("");
    typeLine();
    return () => { isCancelled = true; };
    // eslint-disable-next-line
  }, [text, speed, lineDelay]);

  return <pre style={{ whiteSpace: "pre-wrap" }}>{displayed}</pre>;
} 