'use client';

export default function Loading() {
  return (
    <div className="relative w-full h-full space-y-8 animate-pulse p-1">
      
      {/* 1. Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>

      {/* 2. KPI Cards Skeleton (Grid of 4) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
            <div className="h-8 w-32 bg-gray-100 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Skeleton (Charts/Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Large Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-100 rounded mb-6"></div>
          <div className="flex items-end gap-2 h-64">
            <div className="w-full bg-gray-50 h-3/4 rounded-t-md"></div>
            <div className="w-full bg-gray-100 h-1/2 rounded-t-md"></div>
            <div className="w-full bg-gray-50 h-full rounded-t-md"></div>
            <div className="w-full bg-gray-100 h-2/3 rounded-t-md"></div>
            <div className="w-full bg-gray-50 h-1/3 rounded-t-md"></div>
          </div>
        </div>
        {/* Side Panel Area */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="h-6 w-32 bg-gray-100 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-50 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-50 rounded"></div>
            <div className="h-4 w-full bg-gray-50 rounded"></div>
            <div className="h-32 w-full bg-gray-100 rounded-full mx-auto mt-8"></div>
          </div>
        </div>
      </div>

      {/* 4. PROFESSIONAL OVERLAY */}
      {/* This sits on top of the skeleton to tell the user what is happening */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          
          {/* Animated Logo / Spinner */}
          <div className="relative mb-4">
            <div className="h-12 w-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 h-12 w-12 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin"></div>
            {/* Optional: Center Dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-[#E30613] rounded-full"></div>
          </div>

          <h3 className="text-lg font-bold text-gray-900">Loading Dashboard</h3>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest data...</p>
          
          {/* Progress Bar Animation */}
          <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden relative">
            <div className="h-full bg-[#E30613] w-1/3 absolute top-0 left-0 progress-bar"></div>
          </div>
        </div>
      </div>

      {/* Custom Keyframe for the progress bar */}
      <style jsx>{`
        .progress-bar {
          animation: loading 1.5s ease-in-out infinite;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}