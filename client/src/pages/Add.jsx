import { useState } from "react";

function Add() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    if (message.length <= 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await result.json();
      setReply(data.reply);
      setMessage("");
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  return (
    <div className="flex flex-col h-screen text-white p-5 gap-5">
      <h1 className="text-4xl font-bold">Add</h1>

      <div className="flex-1 overflow-y-auto border rounded p-3 ">
        {reply ? (
          <div>{reply}</div>
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded p-2 text-white resize-none h-24"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a recipe and any changes you will like to make..."
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Add;
