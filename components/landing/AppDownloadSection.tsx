'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { landingService } from '@/services/landingService';
import type { PublicAppRelease } from '@/types/landing';

export default function AppDownloadSection() {
  const [release, setRelease] = useState<PublicAppRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    landingService
      .getAppRelease()
      .then((res) => {
        if (active) setRelease(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="app" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-800 to-blue-600 px-6 py-12 text-center sm:px-12">
          <Smartphone className="mx-auto text-blue-200" size={38} />
          <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            Study anywhere with the Android app
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Download a subject once, then practice questions, answers and explanations with no internet.
            Log in with the same username and password.
          </p>

          {loading ? (
            <div className="mx-auto mt-7 h-12 w-56 animate-pulse rounded-xl bg-white/20" />
          ) : release ? (
            <>
              <a
                href={release.downloadUrl}
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-blue-800 hover:bg-blue-50"
              >
                <Download size={18} />
                Download the App
              </a>
              <p className="mt-3 text-xs text-blue-200">
                Version {release.version}
                {release.sizeMb ? ` · ${release.sizeMb} MB` : ''} · Android only
              </p>
              {release.notes && <p className="mt-1 text-xs text-blue-200">{release.notes}</p>}
              <p className="mx-auto mt-4 max-w-md text-[11px] text-blue-200/80">
                If Android asks, allow installing from this source to finish installing the app.
              </p>
            </>
          ) : (
            <p className="mt-7 inline-block rounded-xl border border-white/30 px-5 py-3 text-sm text-blue-100">
              Ask your teacher for the app download link.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}