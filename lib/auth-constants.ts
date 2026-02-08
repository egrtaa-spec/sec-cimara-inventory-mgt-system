// Pre-defined 5 users for CIMARA system
// In production, these should be created via an admin interface
// Passwords are hashed using bcrypt

export const PREDEFINED_USERS = [
  {
    id: 'user-1',
    name: 'Tah Gizete',
    email: 'tah.gizete@cimara.cm',
    username: 'tahgizete',
    password: 'CimaraAdmin@123', // Change these in production
    role: 'admin'
  },
  {
    id: 'user-2',
    name: 'Jean Paul',
    email: 'jean.paul@cimara.cm',
    username: 'jeanpaul',
    password: 'CimaraUser@456',
    role: 'user'
  },
  {
    id: 'user-3',
    name: 'Marie Dupont',
    email: 'marie.dupont@cimara.cm',
    username: 'mariedupont',
    password: 'CimaraUser@789',
    role: 'user'
  },
  {
    id: 'user-4',
    name: 'Claude Lemoine',
    email: 'claude.lemoine@cimara.cm',
    username: 'claudelemoine',
    password: 'CimaraUser@101',
    role: 'user'
  },
  {
    id: 'user-5',
    name: 'Sophie Martin',
    email: 'sophie.martin@cimara.cm',
    username: 'sophiemartin',
    password: 'CimaraUser@202',
    role: 'user'
  }
];

export const SESSION_COOKIE_NAME = 'cimara_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
