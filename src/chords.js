// Define all possible keys in order for transposition
const KEYS_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const KEYS_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Helper: find index of key in KEYS_SHARP or KEYS_FLAT
function findKeyIndex(key) {
  let idx = KEYS_SHARP.indexOf(key);
  if (idx === -1) idx = KEYS_FLAT.indexOf(key);
  return idx;
}

// Transpose single key by n semitones
export function getTransposedKey(key, steps) {
  if (!key) return "";
  const idx = findKeyIndex(key);
  if (idx === -1) return key;
  const newIdx = (idx + steps + 12) % 12;
  return KEYS_SHARP[newIdx]; // always return sharp notation
}

// Transpose a chord string (e.g., "C", "Am", "D7") by n semitones
export function transposeChord(chord, steps) {
  if (!chord) return "";
  const regex = /^([A-G]{1}[b#]?)(.*)$/; // captures root + suffix
  const match = chord.match(regex);
  if (!match) return chord; // if not match, return original

  const root = match[1];
  const suffix = match[2] || "";
  const transposedRoot = getTransposedKey(root, steps);
  return transposedRoot + suffix;
}

// Transpose an array of chords (e.g., ["C", "Am", "F"]) by n semitones
export function getTransposedChords(chordsArray, steps) {
  if (!chordsArray || !Array.isArray(chordsArray)) return [];
  return chordsArray.map((ch) => transposeChord(ch, steps));
}
