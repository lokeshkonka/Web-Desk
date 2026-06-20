export const Journal = () => (
  <div className="flex flex-col h-full bg-[#fdf6e3] text-[#657b83] font-content p-4 border-l-[20px] border-[#cb4b16]">
    <h1 className="text-2xl font-heading mb-4 text-[#b58900]">My Journal</h1>
    <textarea 
      className="flex-1 bg-transparent border-none outline-none resize-none font-content text-lg"
      placeholder="No notes yet."
      spellCheck="false"
    />
  </div>
);
