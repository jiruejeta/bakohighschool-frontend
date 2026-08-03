import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  const adminToken = request.cookies.get('bako_token')?.value;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isLoginRoute && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Student route protection
  const studentToken = request.cookies.get('bako_student_token')?.value;
  const isStudentProtectedRoute = pathname.startsWith('/student') && pathname !== '/student/login';
  const isStudentLoginRoute = pathname === '/student/login';

  if (isStudentProtectedRoute && !studentToken) {
    return NextResponse.redirect(new URL('/student/login', request.url));
  }
  if (isStudentLoginRoute && studentToken) {
    return NextResponse.redirect(new URL('/student/subjects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/student/:path*'],
};