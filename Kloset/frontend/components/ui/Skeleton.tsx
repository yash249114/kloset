'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circle';
}

export default function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };
  
  return (
    <div className={`shimmer animate-pulse bg-gradient-to-br from-ivory-dark to-ivory ${variantClasses[variant]} ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="h-4 bg-ivory-dark w-1/2 rounded" />
            <div className="h-8 bg-ivory-dark w-2/3 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-10 bg-white border border-border w-1/3 rounded-lg" />
          <div className="h-40 bg-white border border-border rounded-2xl" />
          <div className="h-40 bg-white border border-border rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-80 bg-white border border-border rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function WishlistSkeleton() {
  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-border rounded-lg overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center pt-3 border-t border-border/40">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
        <div className="flex gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded" />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6">
              <Skeleton className="w-full md:w-32 aspect-[3/4] rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-36 rounded" />
                  <Skeleton className="h-10 w-36 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OutfitDetailSkeleton() {
  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <Skeleton className="h-3 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-32 rounded-full" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-52 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/80">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-16 w-40 rounded-xl" />
            <Skeleton className="h-16 w-40 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-1.5 md:col-span-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[52px] w-full rounded" />
            ))}
          </div>
          <div className="md:col-span-3">
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <Skeleton className="h-5 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-[52px] w-full rounded" />
                <Skeleton className="h-[52px] w-full rounded" />
              </div>
              <Skeleton className="h-[52px] w-full rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-[52px] w-full rounded" />
                <Skeleton className="h-[52px] w-full rounded" />
              </div>
              <Skeleton className="h-[52px] w-32 rounded ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
