
import React, { useState } from "react";
import { Shape } from "../interfaces/Shape";
import "./ChatPanel.css"; 

interface ChatPanelProps {
  messages: { role: "user" | "ai"; text: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: "user" | "ai"; text: string }[]>>;
  onAddShapes: (shapes: Shape[]) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, setMessages, onAddShapes }) => {
  const [prompt, setPrompt] = useState("");

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
  
    try {
      const response = await fetch("https://localhost:44381/OPenAI/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });
  
      if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "הגעת למגבלת הבקשות, אנא נסה שוב מאוחר יותר." },
        ]);
        setPrompt("");
        return;
      }
  
      if (!response.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: "בבקשה נסה שנית" }]);
        setPrompt("");
        return;
      }
  
      const json = await response.json();
  
      if (!json.choices || !json.choices[0]?.message?.content) {
        setMessages((prev) => [...prev, { role: "ai", text: "בבקשה נסה שנית" }]);
        setPrompt("");
        return;
      }
  
      const contentStr = json.choices[0].message.content;
      let shapesData;
      try {
        shapesData = JSON.parse(contentStr);
      } catch {
        setMessages((prev) => [...prev, { role: "ai", text: "בבקשה נסה שנית" }]);
        setPrompt("");
        return;
      }
  
      const mappedShapes: Shape[] = (shapesData.shapes || []).map((shape: any) => ({
        type: shape.type,
        x: shape.x,
        y: shape.y,
        radius: shape.radius ?? shape.size,
        width: shape.width,
        height: shape.height,
        color: shape.color ?? "black",
        lineWidth: shape.lineWidth ?? 2,
      }));
  
      if (mappedShapes.length > 0) {
        onAddShapes(mappedShapes);
        setMessages((prev) => [...prev, { role: "ai", text: "הציור נוסף בצד ימין" }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "בבקשה נסה שנית" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "בבקשה נסה שנית" }]);
    }
  
    setPrompt("");
  };

  return (
    <div className="chat-panel">
      <h2 className="chat-title">הצאט שלך עם הבוט</h2>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.role === "user" ? "user" : "ai"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <textarea
        className="chat-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
          }
        }}
        placeholder="כתוב כאן מה לצייר..."
        rows={3}
      />
    </div>
  );
};

export default ChatPanel;

