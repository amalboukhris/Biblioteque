const verifyRole = (requiredRole) => {
    return (req, res, next) => {
      const userRole = req.user?.role; // Vérifie si req.user contient un rôle
      if (!userRole || userRole !== requiredRole) {
        return res.status(403).json({ message: "Access denied: Admins only" });
      }
      next(); // Autorise l'accès si le rôle correspond
    };
  };
  
  module.exports = verifyRole;
  