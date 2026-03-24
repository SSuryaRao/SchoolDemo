export const ROUTES = {
  LOGIN: '/login',
  ADMIN_DASHBOARD:  '/admin/dashboard',
  ADMIN_STUDENTS:   '/admin/students',
  ADMIN_STUDENT_PROFILE: '/admin/students/:id',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_GRADES:     '/admin/grades',
  ADMIN_FEES:       '/admin/fees',
  ADMIN_CALENDAR:   '/admin/calendar',
  STUDENT_PORTAL:   '/student/portal',
  PARENT_PORTAL:    '/parent/portal',
};

export function adminStudentPath(id) {
  return `/admin/students/${id}`;
}
