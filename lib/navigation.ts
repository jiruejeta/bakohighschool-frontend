import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Search,
  Users,
  Trophy,
  Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Chapters', href: '/admin/chapters', icon: Layers },
  { label: 'National Exams', href: '/admin/national-exams', icon: FileText },
  { label: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { label: 'Search', href: '/admin/search', icon: Search },
  { label: 'Sections', href: '/admin/sections', icon: GraduationCap },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Top Students', href: '/admin/top-students', icon: Trophy },
  { label: 'App Releases', href: '/admin/app-releases', icon: Smartphone },
];