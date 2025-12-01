const Admin = require("../models/adminModel");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
// Removed bcryptjs since you are using plain text passwords

const sendresetpasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hello ' + name + ', Please copy the link to<a href="http://localhost:3000/new-password?token=' + token + '"> reset your password</a></p>'
        }

        transporter.sendMail(mailoptions, function (error, info) {
            if (error) {
                console.log("error while sending : ", error);
            }
            else {
                console.log("Mail has been sent :- ", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const createtoken = async (id) => {
    try {
        const token = jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (error) {
        console.log(error.message);
    }
}

// 1. REGISTER: Store Password as Plain Text (No Encryption)
const registerAdmin = async (req, res) => {
    try {
        // DIRECT ASSIGNMENT - NO HASHING
        const spassword = req.body.password; 
        
        const admin = new Admin({
            name: req.body.lname,
            phone: req.body.phone,
            email: req.body.email,
            password: spassword,
            profilepic: req.body.profilepic,
        });

        const adminData = await Admin.findOne({ email: req.body.email });

        if (adminData) {
            res.status(400).send({ success: false, msg: "Admin already exists" });
        }
        else {
            const token = await createtoken();
            
            // SECURITY: Required for Vercel/Render
            res.cookie('jwt_token', token, { 
                httpOnly: true,
                secure: true, 
                sameSite: "none"
            });
            
            const admin_data = await admin.save();
            res.status(200).send({ success: true, data: admin_data });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in Register Admin : " + error.message);
    }
}

const uploadAdminImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            const picture = ({
                url: '/adminImages/' + req.file.filename,
            });
            res.status(200).send({ success: true, data: picture });
        }
        else {
            res.status(400).send({ success: false, msg: "plz select a file" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// 2. LOGIN: Compare Password as Plain Text
const adminlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password; // Password user typed
        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            // DIRECT STRING COMPARISON (Matches your database)
            if (password === adminData.password) {
                
                const tokenData = await createtoken(adminData._id);
                
                // SECURITY: Required for Vercel/Render Deployment
                res.cookie('jwt_token', tokenData, { 
                    httpOnly: true, 
                    expires: new Date(Date.now() + 25892000000), 
                    secure: true,       // Must be true on HTTPS
                    sameSite: "none"    // Must be "none" for Cross-Site
                });

                const adminResult = {
                    _id: adminData._id,
                    name: adminData.name,
                    phone: adminData.phone,
                    email: adminData.email,
                    password: adminData.password,
                    profilepic: adminData.profilepic,
                }

                const response = {
                    success: true,
                    msg: "user details",
                    data: adminResult
                }

                res.status(200).send(response);
            }
            else {
                res.status(400).send({ success: false, msg: "Admin Login details are incorrect (password incorrect)" });
            }
        } else {
            res.status(400).send({ success: false, msg: "Admin Login details are incorrect (Register First)" });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in Login Admin : " + error.message);
    }
}

// 3. UPDATE PASSWORD: No Encryption
const updatePassword = async (req, res) => {
    try {
        const admin_id = req.body.admin_id;
        var oldpassword = req.body.oldpassword;
        var newpassword = req.body.newpassword;

        const data = await Admin.findOne({ _id: admin_id });
        if (data) {
            // DIRECT COMPARISON
            if (oldpassword === data.password) {
                
                const adminData = await Admin.findByIdAndUpdate({ _id: admin_id }, {
                    $set: {
                        password: newpassword // SAVE AS PLAIN TEXT
                    }
                }, { new: true });

                res.status(200).send({ success: true, msg: "Your password has been updated", data: adminData });
            } else {
                res.status(400).send({ success: false, msg: "Your Old password is incorrect" });
            }
        }
        else {
            res.status(400).send({ success: false, msg: "Admin Id not found!" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            const randomString = randomstring.generate();
            const data = await Admin.updateOne({ email: email }, {
                $set: {
                    token: randomString
                }
            });

            sendresetpasswordMail(adminData.fname, adminData.email, randomString);

            res.status(200).send({ success: true, msg: "Please Check your inbox of mail and reset your password" });

        }
        else {
            res.status(200).send({ success: true, msg: "This Email is not exists!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// 4. RESET PASSWORD: No Encryption
const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await Admin.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            // DIRECT SAVE
            const adminData = await Admin.findByIdAndUpdate({ _id: tokenData._id }, {
                $set: {
                    password: password, 
                    token: ''
                }
            }, { new: true });

            res.status(200).send({ success: true, msg: "admin password has been reset!", data: adminData });
        }
        else {
            res.status(200).send({ success: true, msg: "This link has been expired!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const updateAdmin = async (req, res) => {
    try {
        var id = req.body.id;
        var name = req.body.name;
        var phone = req.body.phone;
        var email = req.body.email;
        var profilepic = req.body.profilepic;

        const admin_data = await Admin.findByIdAndUpdate({ _id: id }, { $set: { name: name, phone: phone, email: email, profilepic: profilepic } }, { new: true });
        res.status(200).send({ success: true, msg: 'admin Updated', data: admin_data });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const adminLogout = async (req, res) => {
    try {
        // SECURITY: Match settings to clear cookie successfully
        res.clearCookie("jwt_token", { 
            httpOnly: true, 
            secure: true, 
            sameSite: "none" 
        });
        res.status(200).send({ success: true, msg: "successfully Loged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.find({
            _id: req.params._id
        });
        res.status(200).send({ success: true, data: admin });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registerAdmin,
    adminlogin,
    forgetPassword,
    resetpassword,
    updatePassword,
    adminLogout,
    updateAdmin,
    uploadAdminImage,
    getAdminById
}