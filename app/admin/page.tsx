'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/app/components/ui/button';

// Dynamic imports for admin components
const BookingsTab = dynamic(() => import('@/app/components/admin/BookingsTab'), { ssr: false });
const CopyTab = dynamic(() => import('@/app/components/admin/CopyTab'), { ssr: false });
const MenuTab = dynamic(() => import('@/app/components/admin/MenuTab'), { ssr: false });
const TestimonialsTab = dynamic(() => import('@/app/components/admin/TestimonialsTab'), { ssr: false });
const GalleryTab = dynamic(() => import('@/app/components/admin/GalleryTab'), { ssr: false });
const MediaTab = dynamic(() => import('@/app/components/admin/SimpleMediaTab'), { ssr: false });
const DesignToolsTab = dynamic(() => import('@/app/components/admin/DesignToolsTab'), { ssr: false });

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('bookings');

  const tabs = [
    { value: 'bookings', label: 'Bookings' },
    { value: 'copy', label: 'Site Copy' },
    { value: 'menu', label: 'Menu' },
    { value: 'testimonials', label: 'Testimonials' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'media', label: 'Media' },
    { value: 'design', label: 'Design Tools' },
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

        <Tabs.Content value="media" className="focus:outline-none">
          <MediaTab />
        </Tabs.Content>

        <Tabs.Content value="design" className="focus:outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DesignToolsTab />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
} 