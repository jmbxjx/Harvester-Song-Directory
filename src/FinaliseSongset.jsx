// FinaliseSongset.jsx
import React, { useState, useEffect } from "react";
import { transposeChord, getTransposedKey } from "./chords";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SongDisplay from "./SongDisplay";

function FinaliseSongset({ songset, setSongset, setFinalising }) {
  const [mode, setMode] = useState("lyricsChords");
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const reorder = (startIndex, endIndex) => {
    const result = Array.from(songset);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setSongset(result);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorder(result.source.index, result.destination.index);
  };

  const handleTranspose = (index, steps) => {
    const newSongs = [...songset];
    newSongs[index].transpose = (newSongs[index].transpose || 0) + steps;
    setSongset(newSongs);
  };

  const copySongsetText = (modeToCopy) => {
    let text = "";
    songset.forEach((song) => {
      text += `${song.Title} (Current Key: ${getTransposedKey(
        song.Key,
        song.transpose
      )})\n`;
      const lines = (song.Lyrics || "").split("\n");
      lines.forEach((line) => {
        if (line.trim().startsWith("[[")) {
          text += `[${line.replace(/\[\[|\]\]/g, "")}]\n`;
        } else if (modeToCopy === "lyrics") {
          const lyricLine = line.replace(/\[([^\]]+)\]/g, "");
          if (lyricLine.trim()) text += lyricLine + "\n";
        } else if (modeToCopy === "chords") {
          const chords = [...line.matchAll(/\[([^\]]+)\]/g)].map((m) =>
            transposeChord(m[1], song.transpose)
          );
          if (chords.length) text += chords.join(" ") + "\n";
        }
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text.trim());
    alert("Songset copied to clipboard!");
  };

  // Sidebar content
  const sidebarContent = (
    <div style={{ padding: "20px", color: "white" }}>
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={() => setFinalising(false)}
          style={{
            padding: "6px 10px",
            border: "1px solid white",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            marginBottom: "8px",
          }}
        >
          ← Back to library
        </button>
        <h2 style={{ margin: 0, marginTop: "8px", color: "white" }}>
          Current Songset
        </h2>
      </div>

      {/* Mode toggles */}
      <div style={{ marginTop: "12px", marginBottom: "12px" }}>
        {["lyricsChords", "lyrics", "chords"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              display: "block",
              marginBottom: "8px",
              padding: "8px 10px",
              border: "1px solid black",
              background: mode === m ? "black" : "white",
              color: mode === m ? "white" : "black",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            {m === "lyricsChords"
              ? "Lyrics+Chords"
              : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Song list */}
      <div style={{ marginTop: "12px", overflowY: "auto", maxHeight: "50vh" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="finalSidebar">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {songset.map((song, index) => (
                  <Draggable
                    key={`${song.Title}-${index}`}
                    draggableId={`${song.Title}-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "10px",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          background: "white",
                          color: "black",
                          marginBottom: "8px",
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <strong>{song.Title}</strong>
                            <div style={{ marginTop: "6px" }}>
                              Key: {getTransposedKey(song.Key, song.transpose)}
                              <button
                                onClick={() => handleTranspose(index, -1)}
                                style={{
                                  marginLeft: "6px",
                                  padding: "2px 6px",
                                  fontSize: "11px",
                                }}
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleTranspose(index, 1)}
                                style={{
                                  marginLeft: "4px",
                                  padding: "2px 6px",
                                  fontSize: "11px",
                                }}
                              >
                                +1
                              </button>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                const newSongs = [...songset];
                                newSongs.splice(index, 1);
                                setSongset(newSongs);
                              }}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                border: "1px solid red",
                                background: "white",
                                color: "red",
                                cursor: "pointer",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Copy buttons */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={() => copySongsetText("lyrics")}
          style={{
            padding: "10px",
            border: "1px solid #F0A500",
            background: "transparent",
            color: "#F0A500",
            cursor: "pointer",
          }}
        >
          Copy lyrics
        </button>
        <button
          onClick={() => copySongsetText("chords")}
          style={{
            padding: "10px",
            border: "1px solid #F0A500",
            background: "transparent",
            color: "#F0A500",
            cursor: "pointer",
          }}
        >
          Copy chords
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        fontFamily: "Helvetica",
        minHeight: "100vh",
      }}
    >
      {/* Desktop: Sidebar */}
      {!isMobile && (
        <div
          style={{
            width: "260px",
            background: "#333",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {sidebarContent}

          {/* Finalise Button */}
          <button
            onClick={() => setFinalising(true)}
            style={{
              marginTop: "12px",
              marginBottom: "10px",
              padding: "10px",
              width: "97%",
              maxWidth: "250px",
              minWidth: "140px",
              background: "#F0A500",
              color: "black",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
              boxSizing: "border-box",
              alignSelf: "center",
            }}
          >
            Finalise Songset
          </button>
        </div>
      )}

      {/* Right Panel / Song Details */}
      <div
        style={{
          width: isMobile ? "100%" : "780px",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {songset.length === 0 ? (
          <div style={{ color: "#666" }}>No songs in songset.</div>
        ) : (
          songset.map((song, idx) => (
            <div
              key={`${song.Title}-${idx}`}
              style={{
                marginBottom: "28px",
                background: "white",
                padding: "12px",
                borderRadius: "6px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{song.Title}</h3>
              <div style={{ marginBottom: "8px" }}>
                Chosen Key:{" "}
                <strong>{getTransposedKey(song.Key, song.transpose)}</strong>
              </div>

              {/* Compact SongDisplay */}
              <SongDisplay
                song={song}
                transpose={song.transpose}
                mode={mode}
                onTranspose={(steps) => {
                  const newSongs = [...songset];
                  newSongs[idx].transpose = (newSongs[idx].transpose || 0) + steps;
                  setSongset(newSongs);
                }}
                addToSongset={null}
                goBack={null}
                setMode={null}
                compact={true}
              />
            </div>
          ))
        )}
      </div>

      {/* Mobile Floating Bottom Sidebar */}
      {isMobile && (
        <>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              position: "fixed",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              padding: "10px 20px",
              borderRadius: "25px",
              border: "1px solid #F0A500",
              background: "white",
              color: "#F0A500",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Open Songset
          </button>

          {mobileSidebarOpen && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "70%",
                background: "#333",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                zIndex: 1001,
                overflowY: "auto",
                padding: "20px",
              }}
            >
              <button
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  marginBottom: "12px",
                  padding: "6px 10px",
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ↓ Close Songset
              </button>

              {sidebarContent}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FinaliseSongset;
