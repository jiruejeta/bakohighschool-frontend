import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Search,
  Users,
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
];