const jsonwebtoken = require("jsonwebtoken");

const jwt = {

    issueJWT: async user => {
        let payload = {
            id: user.id,
            company_id: user.company_id
        };
        const options = {
            expiresIn: '365d'//'60000ms'
        };
        const jwtToken = await jsonwebtoken.sign(payload, 'KEy', options);
        return jwtToken;
    },

    verifyTokenFn: async (req, res, next) => {
        var token = req.headers.authorization
        if (token) {
            await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
                if (err) {
                    return res.json({
                        status: 400,
                        success: false,
                        message: "Please login Again token expire",
                    });
                } else {
                    req.user = {
                        id: decoded.id,
                        company_id: decoded.company_id
                    }
                    return next();
                }
            });
        } else {
            return res.json({
                status: 400,
                success: false,
                message: "unauthorized",
            });
        }
    }
};
module.exports = jwt;