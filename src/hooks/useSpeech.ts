import { useCallback, useEffect, useRef, useState } from "react";

const FEMALE_VOICE_HINTS =
  /female|samantha|serena|kate|sonia|karen|moira|tessa|hazel|susan|libby|aria|jenny|michelle|zira|salli|joanna|amy|emma/i;

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const available =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;

    setSupported(available);
    if (!available) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string, options?: { interrupt?: boolean; rate?: number }) => {
      if (!supported || typeof window === "undefined") return false;

      try {
        const synth = window.speechSynthesis;
        if (voicesRef.current.length === 0) {
          voicesRef.current = synth.getVoices();
        }

        if (options?.interrupt !== false) synth.cancel();
        if (!text.trim()) return false;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = voicesRef.current;
        const englishVoices = voices.filter((voice) =>
          voice.lang?.toLowerCase().startsWith("en"),
        );
        const femaleBritish = englishVoices.find(
          (voice) =>
            voice.lang.toLowerCase().startsWith("en-gb") &&
            FEMALE_VOICE_HINTS.test(voice.name),
        );
        const female = englishVoices.find((voice) => FEMALE_VOICE_HINTS.test(voice.name));
        const british = englishVoices.find((voice) =>
          voice.lang.toLowerCase().startsWith("en-gb"),
        );
        const voice = femaleBritish ?? female ?? british ?? englishVoices[0];

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = "en-GB";
        }

        utterance.rate = options?.rate ?? 0.84;
        utterance.pitch = 1.06;
        utterance.volume = 1;
        synth.speak(utterance);
        return true;
      } catch {
        return false;
      }
    },
    [supported],
  );

  return { speak, stop, supported };
}
