function ChatReply({ versions, isReplyLoading }) {
  const currentVersion = 0;
  return (
    <div className="flex flex-col gap-3">
      <div>{versions[currentVersion]?.description}</div>

      {versions[currentVersion].ingredients && (
        <div>
          <h3 className="font-bold">Ingredients</h3>
          <ul className="list-disc pl-4">
            {versions[currentVersion]?.ingredients
              .split("\n")
              .map((item, index) => (
                <li key={index}>{item}</li>
              ))}
          </ul>
        </div>
      )}
      {versions[currentVersion].instructions && (
        <div>
          <h3 className="font-bold">Instructions</h3>
          <ul className="list-disc">
            {versions[currentVersion]?.instructions
              .split("\n")
              .map((item, index) => (
                <li key={index} className="list-none">
                  {item}
                </li>
              ))}
          </ul>
        </div>
      )}
      {versions[currentVersion].source_prompt && !isReplyLoading && (
        <div className="flex text-black/60 text-sm underline ">
          <button>View prompt</button>
        </div>
      )}
    </div>
  );
}

export default ChatReply;
