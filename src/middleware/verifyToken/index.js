const jwt = require('jsonwebtoken');
const fs = require('fs');

const verifyTokenAndUser = (req, res, next) => {
    const token = req.cookies['jwt_token'];

    if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { username } = decodedToken;

        const filePath = 'users.json';
        if (fs.existsSync(filePath)) {
            const existingUsers = JSON.parse(fs.readFileSync(filePath));
            const user = existingUsers.find((user) => user.username === username);

            if (user) {
                req.user = user;
                next();
            }
        }
    }
    res.redirect('/login?message=Authentication failed!');
};

module.exports = verifyTokenAndUser;