const registerProvider = (req, res) => {

    res.send("Provider registration logic goes here!");


    // backend/controllers/authController.js 
res.status(200).json({
    message: "Login Successful",
    user: {
        id: user.id,
        name: user.name,
        role: user.role
    }
});
};

module.exports = { registerProvider };
