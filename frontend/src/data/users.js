export const users = [
  {
    id: 'u1',
    email: 'admin@springfield.edu',
    password: 'admin123',
    role: 'admin',
    name: 'Margaret Hayes',
    title: 'Principal',
    linkedStudentId: null,
  },
  {
    id: 'u2',
    email: 'alex.johnson@springfield.edu',
    password: 'student123',
    role: 'student',
    name: 'Alex Johnson',
    title: 'Student',
    linkedStudentId: 's1',
  },
  {
    id: 'u3',
    email: 'parent.johnson@springfield.edu',
    password: 'parent123',
    role: 'parent',
    name: 'Robert Johnson',
    title: "Alex's Parent",
    linkedStudentId: 's1',
  },
];

export const demoCredentials = [
  { role: 'admin', label: 'Admin / Principal', email: 'admin@springfield.edu', password: 'admin123', color: 'blue' },
  { role: 'student', label: 'Student', email: 'alex.johnson@springfield.edu', password: 'student123', color: 'purple' },
  { role: 'parent', label: 'Parent', email: 'parent.johnson@springfield.edu', password: 'parent123', color: 'green' },
];
