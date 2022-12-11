
const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const PasswordResetToken = require('../models/passwordResetToken');
const {generateOTP,generateMailTransporter} = require('../utils/mail')
const {sendError,generateRandomByte} = require('../utils/helper')

const {isValidObjectId} = require('mongoose');


exports.create = async(req,res) => {

	const {name,email,password} = req.body;

	const oldUser = await User.findOne({email});
	if(oldUser)
	{
		return sendError(res,"email is already in use!!!");
	}
	const newUser = new User({name,email,password});
    
    await newUser.save();

    //1- Generate OTP
    let OTP = generateOTP();
    //2- Store OTP insside Database
    const newEmailVerificationToken = new EmailVerificationToken({
    		owner:newUser._id,
    		token:OTP
    	})

    await newEmailVerificationToken.save();

    //3- Send that OTP to our user
   var transport = generateMailTransporter();

   transport.sendMail({
   		from:'verification@reviewApp.com',
   		to:newUser.email,
   		subject:'Email Verification',
   		html:`
   			<p>Your verifiction OTP<p>
   			<h1>${OTP}<h1>
   		`
   })

	return sendError(res,"Verification mail has been sent. Pleadse Verify Your Email account!!",201);
}

exports.verifyEmail =  async(req,res) =>{
	const {userId,OTP} = req.body;

	if(!isValidObjectId(userId))
	{
		return sendError(res,"Invalid User");
	}

	const user = await User.findById(userId)

	if(!user)
	{
		return sendError(res,"User Not Found",404);
	}

	if(user.isVerified)
	{
		return sendError(res,"User is Already Verified");		
	}

	const token = await EmailVerificationToken.findOne({owner : userId});

	if(!token)
	{
		return sendError(res,"Token Not Found");
			
	}

	const isMatched = await token.compareToken(OTP);

	if(!isMatched)
	{
		return sendError(res,"OTP not Valid");
	}

	user.isVerified = true;
	await user.save();

	await EmailVerificationToken.findByIdAndDelete(token._id);

	const transport = generateMailTransporter();

   transport.sendMail({
   		from:'verification@reviewApp.com',
   		to:user.email,
   		subject:'Welcome Email',
   		html:`
      			<h1>Welcome To Our App .Thanks for Choosing Us :)</h1>
   		`
   })

	return sendError(res,"Your email is verified");

};


exports.resendEmailVerificationToken = async(req,res) => {

	const {userId} = req.body;

	const user = await User.findById(userId)
	if(!user)
	{
		return sendError(res,"User Not Found");	
	}

	if(user.isVerified)
		return sendError(res,"Already Verified");

	const alreadyHasToken = await EmailVerificationToken.findOne({owner : userId});

	if(alreadyHasToken)
	{
		return sendError(res,"Only after one hour You can request another token");	
	}	

	let OTP = generateOTP();
    
    //2- Store OTP insside Database
    const newEmailVerificationToken = new EmailVerificationToken({
    		owner:user._id,
    		token:OTP
    	})

    await newEmailVerificationToken.save();

    //3- Send that OTP to our user
   var transport = generateMailTransporter();

   transport.sendMail({
   		from:'verification@reviewApp.com',
   		to:user.email,
   		subject:'Email Verification',
   		html:`
   			<p>Your verifiction OTP<p>
   			<h1>${OTP}<h1>
   		`
   })	

   return sendError(res,"New OTP has been sent");
}


//----------------------Forget Password---------------------------

exports.forgetPassword = async(req,res) =>{
   const {email} = req.body;

   if(!email)
   	return sendError(res,"email is Missing");

   const user = await User.findOne({email});
   if(!user)
   	return sendError(res,"User Not Found",404);
   
   const alreadyHasToken = await PasswordResetToken.findOne({owner:user._id});
   if(alreadyHasToken)
   	return sendError(res,"Only after one hour You can request another token");

   const token = await generateRandomByte();
   const newPasswordResetToken = await PasswordResetToken({owner:user._id,token});
   
   await newPasswordResetToken.save();

   const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

   var transport = generateMailTransporter();

   transport.sendMail({
   		from:'security@reviewApp.com',
   		to:user.email,
   		subject:'Reset Password Link',
   		html:`
   			<p>Click Here to reset Password <p>
   			<a href = '${resetPasswordUrl}'>Change Password</>
   		`
   })	

   return res.json({message : "Link Sent to your MAIL!!"});

}


exports.sendResetPasswordTokenStatus = (req,res) => {
	res.json({valid:true});
};


exports.resetPassword = async(req,res) => {
	
	const {newPassword,userId} = req.body;

	const user = await User.findById(userId);

	const matched = await user.comparePassword(newPassword);

	if(matched)
		return sendError(res,'!!!New password must be different from old one');

	user.password = newPassword;
	await user.save();

	await PasswordResetToken.findByIdAndDelete(req.resetToken._id);


	const transport = generateMailTransporter();

   transport.sendMail({
   		from:'security@reviewApp.com',
   		to:user.email,
   		subject:'Password Reset Successful',
   		html:`
      			<h1>Password reset Successful!!</h1>
      			<p> Now you can use new password</p>
   		`
   })

	return sendError(res,"Password reset Successful!!.Now you can use new password");


};
