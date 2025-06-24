import ReportHistory from "../components/ReportHistory"

export default function page() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Report History</h2>
        <ReportHistory />
    </div>
  )
}

