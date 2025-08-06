
import React, { useRef, useState } from "react";
import DrawingCanvas from "./components/DrawingCanvas";
import ChatPanel from "./components/ChatPanel";
import ControlButtons from "./components/BottonsActions";
import { Shape } from "./interfaces/Shape";
import "./App.css";

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Shape[][]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const clearDrawing = () => {
    setShapes([]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleClearAll = () => {
    clearDrawing();
    clearChat();
  };

  const addShapes = (newShapes: Shape[]) => {
    setHistory((prev) => [...prev, [...shapes]]);
    setRedoHistory([]);
    setShapes((prev) => [...prev, ...newShapes]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoHistory((prev) => [[...shapes], ...prev]);
    setShapes(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[0];
    setHistory((prev) => [...prev, [...shapes]]);
    setShapes(next);
    setRedoHistory((prev) => prev.slice(1));
  };

  const clearShapes = () => {
    setHistory((prev) => [...prev, [...shapes]]);
    setRedoHistory([]);
    setShapes([]);
  };

  const saveDrawing = async (name: string) => {
    if (!name.trim()) {
      alert("נא למלא שם ציור לפני שמירה");
      return;
    }

    try {
      const response = await fetch("https://localhost:44381/api/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          jsonData: JSON.stringify({ shapes }),
        }),
      });
      if (response.ok) {
        alert("הציור נשמר בהצלחה!");
      } else {
        alert("שגיאה בשמירה");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDrawing = async (name: string) => {
    if (!name.trim()) {
      alert("נא למלא שם ציור לפני טעינה");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:44381/api/Drawings/${encodeURIComponent(name)}`
      );
      if (response.ok) {
        const drawing = await response.json();
        if (drawing && drawing.jsonData) {
          const parsed = JSON.parse(drawing.jsonData);

          if (parsed.shapes) {
            const normalizedShapes = parsed.shapes.map((s: any) => {
              if (s.type?.toLowerCase() === "circle" && s.size && !s.radius) {
                return { ...s, radius: s.size };
              }
              return s;
            });

            setShapes(normalizedShapes);
          } else if (Array.isArray(parsed)) {
            setShapes(parsed);
          } else {
            setShapes([]);
          }
        }
        alert("הציור נטען בהצלחה!");
      } else {
        alert("לא נמצא ציור בשם הזה");
      }
    } catch (err) {
      console.error(err);
      alert("שגיאה בחיבור לשרת");
    }
  };

  return (
    <div className="app-container">
      <div className="top-buttons-row">
        <div className="left-empty-space" />
        <div className="buttons-center">
          <ControlButtons
            onUndo={undo}
            onRedo={redo}
            onClear={clearShapes}
            onSave={saveDrawing}
            onLoad={loadDrawing}
            undoDisabled={history.length === 0}
            redoDisabled={redoHistory.length === 0}
            onNewChat={handleClearAll}
          />
        </div>
      </div>

      <div className="bottom-main-area">
        <div className="chat-left-area">
          <ChatPanel messages={messages} setMessages={setMessages} onAddShapes={addShapes} />
        </div>

        <div className="canvas-right-area">
          <DrawingCanvas shapes={shapes} canvasRef={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
