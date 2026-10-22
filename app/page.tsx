import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Download,
  GraduationCap,
  ShieldCheck,
  Smartphone,
  Video,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bako High School | Online Exam Bank',
  description:
    'Bako High School online exam bank. Practice previous national exam questions with answers, explanations and videos, online or offline.',
};

// ---- EDIT THESE ----
const SCHOOL_NAME = 'Bako High School';
const APK_URL = ''; // paste your APK download link here, e.g. https://expo.dev/artifacts/...
// --------------------

const features = [
  {
    icon: BookOpen,
    title: 'Previous National Exams',
    text: 'Practice real exam questions by subject, year and chapter, with the correct answer shown right after you choose.',
  },
  {
    icon: GraduationCap,
    title: 'Clear Explanations',
    text: 'Every question comes with a written explanation so you learn why an answer is right, not just what it is.',
  },
  {
    icon: Video,
    title: 'Video Lessons',
    text: 'Watch video explanations for harder questions. Download a video once and watch it any time.',
  },
  {
    icon: Clock,
    title: 'Timed Online Exams',
    text: 'Take a full timed exam on the website and see your score and a full review as soon as you finish.',
  },
  {
    icon: Smartphone,
    title: 'Study Offline',
    text: 'Download a subject to your phone with the Android app and keep practicing without internet.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe and School-Managed',
    text: 'Accounts are created by the school. Your teacher gives you a username and password.',
  },
];

const gallery = [
  { src: '/images/students-1.jpg', alt: 'Bako High School students in class' },
  { src: '/images/students-2.jpg', alt: 'Students studying together' },
  { src: '/images/students-3.jpg', alt: 'Bako High School compound' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative h-9 w-9 overflow-hidden rounded-lg bg-blue-50">
              <Image src="/images/logo.jpg" alt="" fill sizes="36px" className="object-cover" />
            </span>
            <span className="text-sm font-bold text-blue-950 sm:text-base">{SCHOOL_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#about" className="hover:text-blue-700">About</a>
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#gallery" className="hover:text-blue-700">Gallery</a>
            <a href="#app" className="hover:text-blue-700">Mobile App</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 sm:text-sm"
            >
              Admin
            </Link>
            <Link
              href="/student/login"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-800 sm:text-sm"
            >
              Student Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-blue-900">
        <Image
          src="/images/hero.jpg"
          alt="Students of Bako High School"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-950/90 via-blue-900/80 to-blue-700/60" />

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <p className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
            ONLINE EXAM BANK
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Learn, practice and pass with {SCHOOL_NAME}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-blue-100 sm:text-lg">
            Practice previous national exam questions with answers, explanations and
            videos. Study online on the website or offline with our Android app.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/student/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-blue-800 shadow-lg shadow-blue-950/30 hover:bg-blue-50"
            >
              Student Login
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 bg-blue-50/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">About us</p>
            <h2 className="mt-2 text-2xl font-extrabold text-blue-950 sm:text-4xl">
              About {SCHOOL_NAME}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              {SCHOOL_NAME} is committed to helping every student reach their best.
              Our school brings together dedicated teachers and motivated students from
              Grade 9 to Grade 12, preparing them for the national examination and for
              life after school.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              This exam bank puts years of national exam questions, with clear
              explanations, in the hands of every student, at school, at home, even
              without internet.
            </p>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-blue-100 shadow-xl shadow-blue-200/60">
            <Image
              src="/images/about.jpg"
              alt="Bako High School"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Features</p>
            <h2 className="mt-2 text-2xl font-extrabold text-blue-950 sm:text-4xl">
              Everything a student needs to prepare
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-blue-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-blue-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-500 text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-blue-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="scroll-mt-20 bg-blue-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Our students</p>
            <h2 className="mt-2 text-2xl font-extrabold text-blue-950 sm:text-4xl">
              Life at {SCHOOL_NAME}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {gallery.map((item) => (
              <div
                key={item.src}
                className="relative aspect-4/5 overflow-hidden rounded-2xl bg-blue-100 shadow-md shadow-blue-100"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE APP */}
      <section id="app" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-800 to-blue-600 px-6 py-12 text-center sm:px-12">
            <Smartphone className="mx-auto text-blue-200" size={38} />
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Study anywhere with the Android app
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Download a subject once, then practice questions, answers and explanations
              with no internet. Log in with the same username and password.
            </p>

            {APK_URL ? (
              <a
                href={APK_URL}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-blue-800 hover:bg-blue-50"
              >
                <Download size={18} />
                Download the App
              </a>
            ) : (
              <p className="mt-7 inline-block rounded-xl border border-white/30 px-5 py-3 text-sm text-blue-100">
                Ask your teacher for the app download link.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-blue-100 bg-blue-50/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">Ready to start practicing?</h2>
          <p className="mt-2 text-slate-600">
            Log in with the username and password your school gave you.
          </p>
          <Link
            href="/student/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-800"
          >
            Student Login
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-950 text-blue-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/student/login" className="hover:text-white">Student Login</Link>
            <Link href="/login" className="hover:text-white">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}