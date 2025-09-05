// SongDisplay.jsx
import React, { useState, useEffect } from "react";
import { transposeChord, getTransposedKey } from "./chords";

function SongDisplay({
  song,
  transpose = 0,
  mode = "lyricsChords",
  onTranspose,
  addToSongset,
  goBack,
  setMode,
  compact = false, // compact mode hides top controls
}) {
  const [toastVisible, setToastVisible] = useState(false);
  const [internalMode, setInternalMode] = useState(mode);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  if (!song) return null;

  const lines = (song.Lyrics || "").split("\n");
  const currentKey = getTransposedKey(song.Key, transpose);
  const recommendedKey = song.Key;

  const formatForCopy = () => {
    let text = `${song.Title}\nCurrent Key: ${currentKey}\n\n`;
    if (internalMode === "lyrics") {
      lines.forEach((line) => {
        if (line.trim().startsWith("[[")) {
          text += `[${line.replace(/\[\[|\]\]/g, "")}]\n`;
        } else {
          const lyricLine = line.replace(/\[([^\]]+)\]/g, "");
          if (lyricLine.trim() !== "") text += lyricLine + "\n";
        }
      });
    } else if (internalMode === "chords") {
      lines.forEach((line) => {
        if (line.trim().startsWith("[[")) {
          text += `[${line.replace(/\[\[|\]\]/g, "")}]\n`;
        } else {
          const chords = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) =>
            transposeChord(m[1], transpose)
          );
          if (chords.length > 0) text += chords.join(" ") + "\n";
        }
      });
    } else {
      lines.forEach((line) => {
        if (line.trim().startsWith("[[")) {
          text += `[${line.replace(/\[\[|\]\]/g, "")}]\n`;
        } else {
          const lyricLine = line.replace(/\[([^\]]+)\]/g, "");
          if (lyricLine.trim() !== "") text += lyricLine + "\n";
        }
      });
      text += "\n";
      lines.forEach((line) => {
        if (line.trim().startsWith("[[")) {
          text += `[${line.replace(/\[\[|\]\]/g, "")}]\n`;
        } else {
          const chords = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) =>
            transposeChord(m[1], transpose)
          );
          if (chords.length > 0) text += chords.join(" ") + "\n";
        }
      });
    }

    navigator.clipboard.writeText(text.trim());
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const renderLineWithChords = (line, idx) => {
    const chordMatches = [...line.matchAll(/\[([^\]]+)\]/g)];
    if (chordMatches.length === 0)
      return (
        <div key={idx} style={{ color: "black" }}>
          {line}
        </div>
      );

    let chordLine = "";
    let lyricLine = "";
    let lastIndex = 0;
    chordMatches.forEach((match) => {
      const chord = transposeChord(match[1], transpose);
      const lyricSegment = line.slice(lastIndex, match.index);
      chordLine += " ".repeat(lyricSegment.length) + chord;
      lyricLine += lyricSegment;
      lastIndex = match.index + match[0].length;
    });
    lyricLine += line.slice(lastIndex);

    return (
      <div key={idx} style={{ marginBottom: "6px", whiteSpace: "pre" }}>
        <div style={{ color: "#007FFF", fontFamily: "monospace" }}>{chordLine}</div>
        <div style={{ fontFamily: "monospace", color: "black" }}>{lyricLine}</div>
      </div>
    );
  };

  const switchMode = (m) => {
    setInternalMode(m);
    if (setMode) setMode(m);
  };

  return (
    <div style={{ position: "relative", color: "black" }}>
      {/* Top Back / X button */}
      {goBack && !compact && (
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={goBack}
            style={{
              padding: "6px 10px",
              border: "1px solid black",
              background: "transparent",
              color: "black",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to library
          </button>
        </div>
      )}

      {/* Copy / Add buttons */}
      {!compact && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {formatForCopy && (
            <button
              onClick={formatForCopy}
              style={{
                padding: "6px 10px",
                border: "1px solid #007FFF",
                background: "white",
                color: "black",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Copy Song
            </button>
          )}
          {addToSongset && (
            <button
              onClick={() => addToSongset && addToSongset(song)}
              style={{
                padding: "6px 10px",
                border: "1px solid #F0A500",
                background: "white",
                color: "#F0A500",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Add to Songset
            </button>
          )}
        </div>
      )}

      {/* Mode buttons */}
      {!compact && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {["lyricsChords", "lyrics", "chords"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: "6px 8px",
                border: "1px solid black",
                background: internalMode === m ? "black" : "white",
                color: internalMode === m ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {m === "lyricsChords"
                ? "Lyrics+Chords"
                : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Title and Keys */}
      <h2 style={{ marginTop: 0 }}>{song.Title}</h2>
      <div style={{ marginBottom: "8px" }}>
        <div style={{ color: "#444", marginBottom: "4px" }}>
          Recommended / Service key: <strong>{recommendedKey}</strong>
        </div>
        <div>
          <span style={{ fontWeight: "bold" }}>Current Key: {currentKey}</span>
          {onTranspose && (
            <>
              <button
                onClick={() => onTranspose(-1)}
                style={{ marginLeft: "8px", padding: "4px 8px", fontSize: "12px" }}
              >
                -1
              </button>
              <button
                onClick={() => onTranspose(1)}
                style={{ marginLeft: "6px", padding: "4px 8px", fontSize: "12px" }}
              >
                +1
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lyrics and Chords */}
      <div style={{ color: "black", fontSize: "14px" }}>
        {lines.map((line, idx) => {
          if (line.trim().startsWith("[[")) {
            const section = line.replace(/\[\[|\]\]/g, "");
            return (
              <div
                key={`section-${idx}`}
                style={{ fontWeight: "bold", marginTop: "12px", marginBottom: "4px" }}
              >
                [{section}]
              </div>
            );
          }
          if (internalMode === "lyrics")
            return (
              <div key={`lyrics-${idx}`}>{line.replace(/\[([^\]]+)\]/g, "")}</div>
            );
          if (internalMode === "chords") {
            const chords = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) =>
              transposeChord(m[1], transpose)
            );
            return (
              <div
                key={`chords-${idx}`}
                style={{ color: "#007FFF", fontFamily: "monospace" }}
              >
                {chords.join(" ")}
              </div>
            );
          }
          return renderLineWithChords(line, idx);
        })}
      </div>

      {/* Toast */}
      {toastVisible && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default SongDisplay;
