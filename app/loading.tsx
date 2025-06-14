export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-green-400 border-t-transparent mx-auto"></div>
        <p className="text-green-400">Loading your garden...</p>
      </div>
    </div>
  )
}
