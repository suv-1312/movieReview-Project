const {check,validationResult} = require('express-validator');

exports.userValidator = [
 check('name').trim().not().isEmpty().withMessage('Name is Missing'),
 check('email').normalizeEmail().isEmail().withMessage('Invalid Email'),
 check('password')
  	.trim()
  	.not()
  	.isEmpty()
  	.withMessage('Password is Missing')
  	.isLength({min:6,max:10})
  	.withMessage("Password should be 6 to 10 characters long!!!")
 ];

 exports.validatePassword = [
 	check('newPassword')
  	.trim()
  	.not()
  	.isEmpty()
  	.withMessage('Password is Missing')
  	.isLength({min:6,max:10})
  	.withMessage("Password should be 6 to 10 characters long!!!")
 ];

 exports.validate = (req,res,next) => {
 	const error = validationResult(req).array();

 	if(error.length){
 		return res.json({error : error[0].msg})
 	}

 	next();
 } 