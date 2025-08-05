import React, { useEffect, useState } from "react";
import "./BottonsActions.css";

interface ButtonsActionsProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: (name: string) => Promise<void> | void;
  onLoad: (name: string) => void;
  onNewChat: () => void;
  undoDisabled: boolean;
  redoDisabled: boolean;
}

interface DrawingItem {
  id: number;
  name: string;
  jsonData: string | null;
  createdAt: string;
  userId: string | null;
}

const BottonsActions: React.FC<ButtonsActionsProps> = ({
  onUndo,
  onRedo,
  onClear,
  onSave,
  onLoad,
  onNewChat,
  undoDisabled,
  redoDisabled,
}) => {
  const [drawingNames, setDrawingNames] = useState<DrawingItem[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState("");
  const [newDrawingName, setNewDrawingName] = useState("");

  const fetchDrawingNames = async () => {
    try {
      const response = await fetch("https://localhost:44381/api/Drawings");
      if (response.ok) {
        const names = await response.json();
        setDrawingNames(names);
      } else {
        alert("שגיאה בטעינת שמות הציורים");
      }
    } catch (err) {
      console.error(err);
      alert("שגיאה בחיבור לשרת");
    }
  };

  useEffect(() => {
    fetchDrawingNames();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedDrawing(name);
    if (name) onLoad(name);
  };

  const handleSave = async () => {
    if (!newDrawingName.trim()) {
      alert("אנא הזן שם לציור");
      return;
    }

    await onSave(newDrawingName);
    setNewDrawingName("");
    fetchDrawingNames();
  };

  const handleClearAll = () => {
    onClear();
    onNewChat();
    setSelectedDrawing("");
  };

  const handleClear = () => onClear();

  return (
    <div className="buttons-container">
      <button
        onClick={onUndo}
        disabled={undoDisabled}
        className={`btn btn-green ${undoDisabled ? "disabled" : ""}`}
      >
        Undo
      </button>

      <button
        onClick={onRedo}
        disabled={redoDisabled}
        className={`btn btn-blue ${redoDisabled ? "disabled" : ""}`}
      >
        Redo
      </button>

      <button onClick={handleClearAll} className="btn btn-red">
        איפוס ציור וצ'אט
      </button>

      <button onClick={handleClear} className="btn btn-orange">
        איפוס ציורט
      </button>

      <select
        value={selectedDrawing}
        onChange={handleSelectChange}
        className="drawing-select"
      >
        <option value="">בחר ציור</option>
        {drawingNames.map((drawing) => (
          <option key={drawing.id} value={drawing.name}>
            {drawing.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="שם הציור"
        value={newDrawingName}
        onChange={(e) => setNewDrawingName(e.target.value)}
        className="drawing-input"
      />

      <button onClick={handleSave} className="btn btn-purple">
        שמור ציור
      </button>
    </div>
  );
};

export default BottonsActions;
