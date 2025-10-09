import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CloseSvg from "../icons/CloseSvg";
import ErrorSvg from "../icons/ErrorSvg";
import WarningSvg from "../icons/WarningSvg";
function ChatErrorModal({
  isErrorModalOpen,
  setIsErrorModalOpen,
  errors,
  handleDeleteError,
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsErrorModalOpen(false);
      }
    }
    if (isErrorModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isErrorModalOpen, setIsErrorModalOpen]);

  //   if (errors?.length > 0) {
  //     console.log(JSON.parse(errors?.[0].content));
  //     console.log(JSON.parse(errors?.[0].content).source_prompt);
  //   }
  //   console.log(JSON.parse(errors));

  function convertTime(created_at) {
    const now = new Date();
    const created = new Date(created_at + "Z");
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
  }

  if (!isErrorModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex justify-center  z-50 p-4 w-full ">
      <div
        ref={modalRef}
        className="p-4 flex my-20 flex-col bg-crust rounded shadow-lg w-full overflow-y-auto"
      >
        <div className="flex justify-end">
          <button onClick={() => setIsErrorModalOpen(false)}>
            <CloseSvg />
          </button>
        </div>
        <h2 className="font-bold pb-2">Errors</h2>
        <ul className="flex flex-col gap-3">
          {errors?.length > 0
            ? errors.map((item) => {
                return (
                  <li
                    className="bg-rose-100 px-2 py-3 flex gap-2 rounded-lg"
                    key={item.id}
                  >
                    <WarningSvg />
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-rose-900 text-large">
                          {item.error}
                        </h3>
                        <button
                          onClick={() => handleDeleteError(item.id)}
                          className="text-rose-600 hover:text-rose-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-rose-900">{item.errorMessage}</p>
                      <p className="text-gray-500 text-sm italic">
                        Input: {item.source_prompt}
                      </p>
                      <div className="text-rose-800 self-end text-sm">
                        {convertTime(item.created_at)}
                      </div>
                    </div>
                  </li>
                );
              })
            : null}
        </ul>
      </div>
    </div>,
    document.body
  );
}

export default ChatErrorModal;
