const jwt = require("jsonwebtoken");




exports.identifier = (req, res, next) => {
    let token;

    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorization'];
    }

    if (!token) {
        
        if (req.headers.client !== 'not-browser') {
            return res.redirect('/landing');
        }

        
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
        const userToken = token.split(' ')[1];
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

        if (jwtVerified) {
            req.user = jwtVerified;
            return next();
        } else {
            throw new Error('Invalid token');
        }

    } catch (error) {
        console.log(error);

        if (req.headers.client !== 'not-browser') {
            return res.redirect('/landing');
        }

        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};