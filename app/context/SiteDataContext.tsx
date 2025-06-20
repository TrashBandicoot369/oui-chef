'use client';
import React, { createContext, useContext } from 'react';
import useSWR from 'swr';

type SiteData = {
  copy: any[];
  menu: any[];
  testimonials: any[];
  gallery: any[];
  theme: any;
};

const fetchAll = async (): Promise<SiteData> => {
  const [copy, menu, testimonials, gallery, theme] = await Promise.all([
    fetch('/api/public/copy').then(r => r.json()),
    fetch('/api/public/menu').then(r => r.json()),
    fetch('/api/public/testimonials').then(r => r.json()),
    fetch('/api/public/gallery').then(r => r.json()),
    fetch('/api/public/theme').then(r => r.json()),
  ]);
  return { copy, menu, testimonials, gallery, theme };
};

const SiteDataContext = createContext<(SiteData & { refresh: () => void }) | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const { data, mutate } = useSWR('site-data', fetchAll, { suspense: false });
  if (!data) return null;
  const refresh = () => mutate();
  return <SiteDataContext.Provider value={{ ...data, refresh }}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('SiteDataProvider missing');
  return ctx;
}
