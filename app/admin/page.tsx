'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState } from 'react';
import nextDynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/app/components/ui/button';

// Dynamic imports for admin components
const BookingsTab = nextDynamic(() => import('@/app/components/admin/BookingsTab'), { ssr: false });
const CopyTab = nextDynamic(() => import('@/app/components/admin/CopyTab'), { ssr: false });
const MenuTab = nextDynamic(() => import('@/app/components/admin/MenuTab'), { ssr: false });
const TestimonialsTab = nextDynamic(() => import('@/app/components/admin/TestimonialsTab'), { ssr: false });
const GalleryTab = nextDynamic(() => import('@/app/components/admin/GalleryTab'), { ssr: false });

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('bookings');

  const tabs = [
    { value: 'bookings', label: 'Bookings' },
    { value: 'copy', label: 'Site Copy' },
    { value: 'menu', label: 'Menu' },
    { value: 'testimonials', label: 'Testimonials' },
    { value: 'gallery', label: 'Gallery' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Triggers */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs.List className="flex space-x-1 py-4 overflow-x-auto">
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value} asChild>
                  <Button
                    variant={activeTab === tab.value ? 'default' : 'ghost'}
                    className="whitespace-nowrap"
                  >
                    {tab.label}
                  </Button>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs.Content value="bookings" className="focus:outline-none">
          <BookingsTab />
        </Tabs.Content>

        <Tabs.Content value="copy" className="focus:outline-none">
          <CopyTab />
        </Tabs.Content>

        <Tabs.Content value="menu" className="focus:outline-none">
          <MenuTab />
        </Tabs.Content>

        <Tabs.Content value="testimonials" className="focus:outline-none">
          <TestimonialsTab />
        </Tabs.Content>

        <Tabs.Content value="gallery" className="focus:outline-none">
          <GalleryTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
} 