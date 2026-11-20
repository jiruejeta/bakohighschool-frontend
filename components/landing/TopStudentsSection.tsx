'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { landingService } from '@/services/landingService';
import type { PublicTopStudent } from '@/types/landing';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function TopStudentsSection() {
  const [students, setStudents] = useState<PublicTopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    landingService
      .getTopStudents()
      .then((res) => {
        if (active) setStudents(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loading && students.length === 0) return null;

  return (
    <section id="top-students" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Our pride</p>
          <h2 className="mt-2 text-2xl font-extrabold text-blue-950 sm:text-4xl">Top Students</h2>
          <p className="mt-3 text-slate-600">Congratulations to our students with outstanding results.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-blue-100 p-5">
                  <div className="mx-auto h-24 w-24 rounded-full bg-blue-100" />
                  <div className="mx-auto mt-4 h-4 w-24 rounded bg-blue-100" />
                  <div className="mx-auto mt-2 h-5 w-16 rounded bg-blue-100" />
                </div>
              ))
            : students.map((s) => (
                <div
                  key={s._id}
                  className="rounded-2xl border border-blue-100 bg-white p-5 text-center transition-shadow hover:shadow-lg hover:shadow-blue-100"
                >
                  {s.photo?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.photo.url}
                      alt={s.name}
                      loading="lazy"
                      className="mx-auto h-24 w-24 rounded-full border-4 border-blue-100 object-cover sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-blue-500 text-2xl font-bold text-white sm:h-28 sm:w-28">
                      {initialsOf(s.name)}
                    </div>
                  )}
                  <p className="mt-4 text-sm font-bold text-blue-950 sm:text-base">{s.name}</p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-600">
                    <Trophy size={14} />
                    {s.mark}
                  </p>
                  {(s.grade || s.label) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {[s.grade, s.label].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}