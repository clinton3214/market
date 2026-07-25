interface ChatBubbleProps {
  message: string
  isSender: boolean
  timestamp: string
}

export default function ChatBubble({ message, isSender, timestamp }: ChatBubbleProps) {
  if (isSender) {
    // Sender bubble - black with glass effect
    return (
      <div className="flex justify-end mb-4">
        <div className="flex flex-col items-end gap-1 max-w-xs sm:max-w-sm">
          <div className="px-4 py-3 rounded-3xl rounded-br-sm backdrop-blur-xl bg-black/80 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
            <p className="text-white text-sm sm:text-base break-words">{message}</p>
          </div>
          <span className="text-xs text-gray-400 px-2">{timestamp}</span>
        </div>
      </div>
    )
  }

  // Receiver (admin) bubble - purple with glass effect
  return (
    <div className="flex justify-start mb-4">
      <div className="flex flex-col items-start gap-1 max-w-xs sm:max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <span className="text-xs text-gray-400 font-semibold">Admin</span>
        </div>
        <div className="px-4 py-3 rounded-3xl rounded-bl-sm backdrop-blur-xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-400/30 shadow-lg hover:shadow-xl transition-shadow hover:border-purple-400/50">
          <p className="text-white text-sm sm:text-base break-words">{message}</p>
        </div>
        <span className="text-xs text-gray-400 px-2">{timestamp}</span>
      </div>
    </div>
  )
}
