// App.jsx
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import SongDisplay from "./SongDisplay";
import FinaliseSongset from "./FinaliseSongset";
import { getTransposedKey } from "./chords";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQf9C2feoWl7bwsdpSNgWVL3i8quBMV3m-ZxMBOUvw15FTb2skd2Xkr9hwqpxUSf9J5fCnxWSJf3D3l/pub?output=csv";

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songset, setSongset] = useState([]);
  const [finalising, setFinalising] = useState(false);
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [modalTransposeMap, setModalTransposeMap] = useState({});

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const cleanedSongs = results.data.filter(
          (row) => row.Title && row.Key && row.Lyrics
        );
        setSongs(cleanedSongs.length ? cleanedSongs : []);
      },
      error: (err) => {
        console.error("Error parsing sheet:", err);
        setSongs([]);
      },
    });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const addToSongset = (song) => {
    if (!songset.find((s) => s.Title === song.Title)) {
      setSongset([...songset, { ...song, transpose: 0 }]);
      showToast("Song added to songset!");
    } else {
      showToast("Already in songset");
    }
  };

  const removeFromSongset = (index) => {
    const newSet = [...songset];
    newSet.splice(index, 1);
    setSongset(newSet);
    showToast("Song removed from songset!");
  };

  const reorderSongset = (startIndex, endIndex) => {
    const result = Array.from(songset);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setSongset(result);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderSongset(result.source.index, result.destination.index);
  };

  const setModalTranspose = (title, steps) => {
    setModalTransposeMap((prev) => {
      const current = prev[title] || 0;
      return { ...prev, [title]: current + steps };
    });
  };

  const openSongModal = (song) => {
    setModalTransposeMap((prev) => ({ ...prev, [song.Title]: prev[song.Title] ?? 0 }));
    setSelectedSong(song);
  };

  if (finalising) {
    return (
      <FinaliseSongset
        songset={songset}
        setSongset={setSongset}
        setFinalising={setFinalising}
      />
    );
  }

  const filteredSongs = songs
    .filter((s) => (filter === "All" ? true : s.Category?.toLowerCase() === filter.toLowerCase()))
    .sort((a, b) => a.Title.localeCompare(b.Title));

  return (
    <div
      style={{
        fontFamily: "Helvetica",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      {/* Centered main block (full height 16:9) */}
      <div
        style={{
          width: "80vw",
          height: "80vh", // taller for full viewport
          maxWidth: "1400px",
          maxHeight: "800px",
          margin: "24px auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          background: "#f0f0f0",
          padding: "20px",
          borderRadius: "8px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Left: Song Library */}
        <div style={{ paddingRight: "10px", overflowY: "auto" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "12px", color: "black" }}>
            Harvester Song Directory
          </h1>
          <div style={{ marginBottom: "16px" }}>
            {["All", "Praise", "Worship"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  marginRight: "8px",
                  padding: "6px 10px",
                  border: "1px solid black",
                  background: filter === cat ? "black" : "white",
                  color: filter === cat ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {filteredSongs.map((song, idx) => (
              <div
                key={`${song.Title}-${idx}`}
                onClick={() => openSongModal(song)}
                style={{
                  padding: "10px",
                  border: "1px solid black",
                  borderRadius: "5px",
                  cursor: "pointer",
                  background: "white",
                  position: "relative",
                }}
              >
                <strong style={{ color: "black" }}>{song.Title}</strong>
                <div style={{ color: "black" }}>Key: {song.Key}</div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "10px",
                    fontSize: "12px",
                    color: "grey",
                  }}
                >
                  {song.Category?.toUpperCase()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToSongset(song);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "10px",
                    padding: "4px 8px",
                    border: "1px solid #F0A500",
                    background: "white",
                    color: "#F0A500",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Songset Sidebar */}
        <div
          style={{
            paddingLeft: "10px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            justifyContent: "space-between", // pushes button to bottom
            background: "#333",
            borderRadius: "8px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "12px", color: "white" }}>Current Songset</h2>
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="songset">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {songset.length === 0 ? (
                        <div style={{ color: "#ffffffff", textAlign: "center", marginTop: "40px" }}>
                          No songs added yet
                        </div>
                      ) : (
                        songset.map((song, index) => (
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
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px",
                                  border: "1px solid #3b3b3bff",
                                  borderRadius: "4px",
                                  marginBottom: "8px",
                                  background: "white",
                                  color: "black",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: "bold" }}>{song.Title}</div>
                                  <div style={{ marginTop: "6px" }}>
                                    Key: {getTransposedKey(song.Key, song.transpose)}
                                  </div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => removeFromSongset(index)}
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
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

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
            }}
          >
            Finalise Songset
          </button>
        </div>
      </div>

      {/* Selected Song Modal */}
      {selectedSong && (
        <div>
          <div
            style={{
              position: "fixed",
              inset: 0,
              backdropFilter: "blur(4px)",
              background: "rgba(0,0,0,0.25)",
              zIndex: 999,
            }}
            onClick={() => setSelectedSong(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "75vw", // taller modal
              maxWidth: "720px",
              height: "90vh", // taller
              overflow: "auto",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 1000,
              boxSizing: "border-box",
            }}
          >
            <SongDisplay
              song={selectedSong}
              transpose={modalTransposeMap[selectedSong.Title] || 0}
              mode={selectedSong.mode || "lyricsChords"}
              onTranspose={(steps) => setModalTranspose(selectedSong.Title, steps)}
              addToSongset={(s) => addToSongset(s)}
              goBack={() => setSelectedSong(null)}
              setMode={(m) => setSelectedSong((prev) => ({ ...prev, mode: m }))}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
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
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
