const users = require("../models/userSchema");
const userotp = require("../models/userOtp");
const nodemailer = require("nodemailer");
const Log = require("../models/logsSchema.js")

// email config
const tarnsporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})
// Import the User model
const User = require("../models/userSchema");

// Function to fetch logged-in user's name
exports.getLoggedInUserName = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.status(200).json({ userName: user.fname }); // Assuming the first name field is 'fname'
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user's name:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.userregister = async (req, res) => {
    const { fname, email, password } = req.body;

    if (!fname || !email || !password) {
        res.status(400).json({ error: "Please Enter All Input Data" })
    }

    try {
        const presuer = await users.findOne({ email: email });

        if (presuer) {
            res.status(400).json({ error: "This User Allready exist in our db" })
        } else {
            const userregister = new users({
                fname, email, password
            });

            // here password hasing

            const storeData = await userregister.save();
            res.status(200).json(storeData);
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }

};



// user send otp
exports.userOtpSend = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Please Enter Your Email" })
    }


    try {
        const presuer = await users.findOne({ email: email });

        if (presuer) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            const existEmail = await userotp.findOne({ email: email });


            if (existEmail) {
                const updateData = await userotp.findByIdAndUpdate({ _id: existEmail._id }, {
                    otp: OTP
                }, { new: true }
                );
                await updateData.save();

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Email Verification",
                    text: `OTP:- ${OTP}`
                }


                tarnsporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully !!!" })
                    }
                })

            } else {

                const saveOtpData = new userotp({
                    email, otp: OTP
                });

                await saveOtpData.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Email Verification",
                    text: `OTP:- ${OTP}`
                }

                tarnsporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully" })
                    }
                })
            }
        } else {
            res.status(400).json({ error: "This User Not Exist In our Db" })
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
};

exports.userLogin = async(req,res)=>{
    const {email,otp} = req.body;

    if(!otp || !email){
        res.status(400).json({ error: "Please Enter Your OTP and email" })
    }

    try {
        const otpverification = await userotp.findOne({email:email});

        if(otpverification.otp === otp){
            const preuser = await users.findOne({email:email});

            if (!preuser) {
                return res.status(400).json({ error: "User not found" });
            }

            // Fetch the username
            const userName = preuser.fname; // Assuming the username field is 'fname'

            // token generate
            const token = await preuser.generateAuthtoken();

            res.status(200).json({ message: "User Login Successfully Done", userToken: token, userName: userName });

        }else{
            res.status(400).json({error:"Invalid Otp"})
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
}


exports.userLogs = async (req, res) => {

      try {
        const logs = await Log.find({}); // Using exec() to ensure the query is executed
        
        console.log('Fetched logs:', logs);
        
        // Check if logs are empty
        if (logs.length === 0) {
          return res.status(404).json({ error: 'No logs found' }); // Respond with 404 status code
        }
        
        // Transform logs into JSON format
        const jsonLogs = logs.map(log => {
          return {
            level: log.level,
            message: log.message,
            source: log.source,
            timestamp: log.timestamp,
            label: log.label
          };
        });
        
        return res.json(jsonLogs); // Respond with fetched logs in JSON format
      } catch (err) {
        console.error('Error fetching logs:', err);
        return res.status(500).json({ error: 'Error fetching logs' }); // Respond with 500 status code for internal server error
      }
    }