function ChatReply({ currentVersion, versions, isReplyLoading }) {
  return (
    <div className="flex flex-col gap-3">
      <div>{versions?.[currentVersion]?.description}</div>

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
        <div className="flex justify-between text-text-secondary/80 text-sm">
          <button className="underline">View prompt</button>
          <p className="text-text-secondary/80">
            {currentVersion + 1} of {versions.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatReply;
