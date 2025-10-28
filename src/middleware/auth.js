const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  console.log('isAdmin check - Session:', req.session); // Debug log
  
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'admin') {
    console.log('Access denied - Role:', req.session.role); // Debug log
    return res.status(403).render('error', {
      message: 'Access Denied',
      error: { 
        status: 403, 
        stack: `You need administrator privileges. Current role: ${req.session.role || 'none'}` 
      }
    });
  }
  
  next();
};

const isTeacher = (req, res, next) => {
  console.log('isTeacher check - Session:', req.session); // Debug log
  
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'teacher') {
    console.log('Access denied - Role:', req.session.role); // Debug log
    return res.status(403).render('error', {
      message: 'Access Denied',
      error: { 
        status: 403, 
        stack: `You need teacher privileges. Current role: ${req.session.role || 'none'}` 
      }
    });
  }
  
  next();
};

const isAdminOrTeacher = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'admin' && req.session.role !== 'teacher') {
    return res.status(403).render('error', {
      message: 'Access Denied',
      error: { 
        status: 403, 
        stack: `You need admin or teacher privileges. Current role: ${req.session.role || 'none'}` 
      }
    });
  }
  
  next();
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