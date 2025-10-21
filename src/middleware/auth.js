const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    message: 'Access Denied',
    error: { status: 403, stack: 'You do not have permission to access this resource' }
  });
};

const isTeacher = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'teacher') {
    return next();
  }
  res.status(403).render('error', {
    message: 'Access Denied',
    error: { status: 403, stack: 'You do not have permission to access this resource' }
  });
};

const isAdminOrTeacher = (req, res, next) => {
  if (req.session && req.session.userId &&
      (req.session.role === 'admin' || req.session.role === 'teacher')) {
    return next();
  }
  res.redirect('/auth/login');
};

// Attach user info to all requests
const attachUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      email: req.session.email,
      full_name: req.session.full_name,
      role: req.session.role,
    };
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isTeacher,
  isAdminOrTeacher,
  attachUser,
};
