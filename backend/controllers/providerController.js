const registerProvider = (req, res) => {
    // මෙතන තමයි Database එකට දත්ත ඇතුළු කරන logic එක ලියන්නේ
    res.send("Provider registration logic goes here!");


    // backend/controllers/authController.js (උදාහරණයක්)
res.status(200).json({
    message: "Login Successful",
    user: {
        id: user.id,
        name: user.name, // මෙන්න මේ field එක හරියටම තියෙන්න ඕනේ
        role: user.role
    }
});
};

module.exports = { registerProvider };