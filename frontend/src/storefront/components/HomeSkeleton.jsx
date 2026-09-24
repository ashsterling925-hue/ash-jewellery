import React from "react";

export default function HomeSkeleton() {
  return (
    <div className="w-full animate-fade-in">
      {/* Top Gold Shimmer Progress Line */}
      <div className="w-full h-[2.5px] luxury-gold-bar fixed top-0 left-0 z-50 shadow-xs" />

      {/* Hero Banner Skeleton */}
      <section className="relative w-full h-[62vh] min-h-[380px] max-h-[580px] luxury-shimmer border-b border-[#e7dfd3] flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle center insignia */}
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <div className="w-20 h-5 luxury-shimmer-subtle rounded-xs" />
          <div className="w-64 sm:w-80 h-8 luxury-shimmer-subtle rounded-xs" />
          <div className="w-44 h-3.5 luxury-shimmer-subtle rounded-xs" />
        </div>

        {/* Carousel indicators placeholder */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-6 h-1 bg-[#d9cdbd]/60 rounded-full" />
          <div className="w-2 h-1 bg-[#d9cdbd]/40 rounded-full" />
          <div className="w-2 h-1 bg-[#d9cdbd]/40 rounded-full" />
        </div>
      </section>

      {/* Categories Bar Skeleton */}
      <section className="border-b border-[#e7dfd3] bg-[#fffdf9] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <div className="w-28 h-3 luxury-shimmer rounded-xs" />
            <div className="w-56 h-6 luxury-shimmer rounded-xs" />
            <div className="w-10 h-0.5 bg-[#c5a265] mt-1" />
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[180px] flex flex-col items-center gap-3">
                <div className="aspect-[0.88/1] w-full luxury-shimmer rounded-none border border-[#e8ded2]" />
                <div className="w-20 h-4 luxury-shimmer rounded-xs" />
                <div className="w-14 h-2.5 luxury-shimmer rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Grid Skeleton */}
      <section className="py-12 bg-[#fbf8f2]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <div className="w-24 h-3 luxury-shimmer rounded-xs" />
            <div className="w-48 h-6 luxury-shimmer rounded-xs" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e7dfd3] p-3 flex flex-col gap-3">
                <div className="aspect-[4/5] w-full luxury-shimmer rounded-none" />
                <div className="w-3/4 h-3.5 luxury-shimmer rounded-xs" />
                <div className="w-1/2 h-3 luxury-shimmer rounded-xs" />
                <div className="w-1/3 h-4 luxury-shimmer rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
