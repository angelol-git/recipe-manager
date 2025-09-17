import { useState, useRef, useEffect } from "react";

function ChatTitle({
  title,
  setCurrentRecipe,
  isEditing,
  setIsEditing,
  handleRename,
}) {
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef(null);
  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleSave() {
    setCurrentRecipe((prev) => ({
      ...prev,
      title: draftTitle,
    }));
    handleRename(draftTitle);
    setIsEditing(false);
  }

  return (
    <div className="w-full">
      {isEditing ? (
        <input
          name="title"
          ref={inputRef}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="text-xl font-bold font-lora border-b border-black w-full"
        />
      ) : (
        <h1
          className="text-xl font-bold font-lora w-full"
          onClick={() => setIsEditing(true)}
        >
          {title}
        </h1>
      )}
    </div>
  );
}

export default ChatTitle;
