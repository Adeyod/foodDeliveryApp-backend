import Customer from '../models/customerModel.js';
import Token from '../models/tokenModel.js';
import {
  createReferralCode,
  forbiddenCharsRegex,
  generateRandomPin,
} from '../utils/middlewares.js';
import bcrypt from 'bcryptjs';

import {
  sendEmailVerificationMobile,
  sendEmailVerificationWeb,
} from '../utils/nodemailer.js';
import ReferralCode from '../models/referralCodeModel.js';
import FoodVendor from '../models/foodVenderModel.js';
import Biker from '../models/bikerModel.js';
import { authUser } from '../utils/jwtAuth.js';

const regCustomer = async (req, res) => {
  try {
    const {
      phoneNumber,
      email,
      firstName,
      lastName,
      userName,
      referralCode,
      password,
      confirmPassword,
      role,
      device,
    } = req.body;

    if (
      !phoneNumber ||
      !email ||
      !firstName ||
      !lastName ||
      !userName ||
      !role ||
      !password ||
      !confirmPassword ||
      !device
    ) {
      return res.json({
        success: false,
        error: 'All fields are required',
      });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedUserName = userName.trim();

    if (forbiddenCharsRegex.test(trimmedFirstName)) {
      return res.json({
        success: false,
        error: 'Forbidden characters in input field for first name.',
        status: 400,
      });
    }

    if (forbiddenCharsRegex.test(trimmedLastName)) {
      return res.json({
        success: false,
        error: 'Forbidden characters in input field for last name.',
        status: 400,
      });
    }

    if (forbiddenCharsRegex.test(trimmedUserName)) {
      return res.json({
        success: false,
        error: 'Forbidden characters in input field for user name.',
        status: 400,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        error: 'Password and confirm password do not match',
        success: false,
        status: 400,
      });
    }

    const customerExist = await Customer.findOne({
      $or: [
        { email: trimmedEmail },
        { userName: { $regex: `^${trimmedUserName}$`, $options: 'i' } },
      ],
    });

    if (customerExist) {
      let errorField;
      if (customerExist.userName === trimmedUserName) {
        errorField = 'userName';
      } else if (customerExist.email === trimmedEmail) {
        errorField = 'email';
      }
      return res.json({
        error: `Customer already exists with this ${errorField}`,
        success: false,
        status: 400,
      });
    }

    const uniqueReferralCode = await createReferralCode(
      trimmedUserName,
      4,
      role
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      userName: trimmedUserName,
      password: hashedPassword,
      myReferralCode: uniqueReferralCode,
      phoneNumber,
      email: trimmedEmail,
    });
    await newCustomer.save();

    if (!newCustomer) {
      return res.json({
        error: 'Unable to create customer',
        success: false,
      });
    } else {
      if (referralCode) {
        const findReferrer = await ReferralCode.findOne({
          code: referralCode,
        });
        console.log(findReferrer);

        if (!findReferrer) {
          console.log('This referrer can not be found');
        }

        if (findReferrer !== null) {
          if (findReferrer.role === 'customer') {
            const findCustomer = await Customer.findOneAndUpdate(
              {
                myReferralCode: findReferrer.code,
              },
              {
                $push: { referredCustomers: newCustomer._id },
              },
              { new: true }
            );

            console.log(findCustomer);
            if (!findCustomer) {
              console.log('No customer document found');
            }
          } else if (findReferrer.role === 'food vendor') {
            const findVendor = await FoodVendor.findOneAndUpdate(
              {
                myReferralCode: findReferrer.code,
              },
              {
                $push: { referredCustomers: newCustomer._id },
              },
              { new: true }
            );

            if (!findVendor) {
              console.log('No vendor document found');
            }

            console.log(findVendor);
          } else if (findReferrer.role === 'biker') {
            const findBiker = await Biker.findOneAndUpdate(
              {
                myReferralCode: findReferrer.code,
              },
              {
                $push: { referredCustomers: newCustomer._id },
              },
              { new: true }
            );

            if (!findBiker) {
              console.log('No biker document found');
            }

            console.log(findBiker);
          }
        }
      }
      // generate verification pin for both web and mobile
      const verificationToken = generateRandomPin(6);

      const newToken = await new Token({
        userId: newCustomer._id,
        token: verificationToken,
        purpose: 'Email verification',
      }).save();

      let sendEmail;

      if (device === 'mobile') {
        sendEmail = await sendEmailVerificationMobile(
          newCustomer.email,
          newCustomer.firstName,
          newToken.token
        );
      } else if (device === 'web') {
        const type = 'customer';
        const link = `${process.env.FRONTEND_URL}/email-verification?userId=${newToken.userId}&token=${newToken.token}&type=${type}`;

        // Send Email verification to user email address
        sendEmail = await sendEmailVerificationWeb(
          newCustomer.email,
          newCustomer.firstName,
          link
        );
      }

      // if sendEmail is successful then send this message to the user
      return res.json({
        message:
          'Please verify your email address with the link sent to your mail',
        success: true,
        status: 200,
      });
    }

    // return to the frontend with the message that user should check email
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      status: 500,
    });
  }
};

const verifyCustomer = async (req, res, next) => {
  try {
    const { userId, token, type, device } = req.body;
    console.log('I get here inside verification logic...');
    console.log(req.body);
    let tokenExist;

    if (device === 'web') {
      tokenExist = await Token.findOne({
        $and: [{ userId }, { token }, { purpose: 'Email verification' }],
      });
    } else if (device === 'mobile') {
      tokenExist = await Token.findOne({
        token,
      });
    }

    if (!tokenExist) {
      return res.json({
        error: 'Token not found',
        success: false,
        status: 404,
      });
    }

    const findCustomer = await Customer.findByIdAndUpdate(
      {
        _id: tokenExist.userId,
      },
      {
        isVerified: true,
      },
      { new: true }
    );

    if (!findCustomer) {
      return res.json({
        success: false,
        status: 404,
        error: 'Customer not found',
      });
    }

    await tokenExist.deleteOne();

    return res.json({
      message: 'Customer verified successfully. You can now login',
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      status: 500,
    });
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { info, password, device } = req.body;
    console.log(req.body);

    if (!info || !password) {
      return res.json({
        error: 'All fields are required',
        success: false,
        status: 400,
      });
    }

    const trimmedInfo = info.trim();

    if (trimmedInfo.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInfo)) {
        return res.json({
          message: 'Invalid input for email...',
          success: false,
          status: 400,
        });
      }
    } else {
      if (forbiddenCharsRegex.test(trimmedInfo)) {
        return res.json({
          error: 'Invalid input for field username...',
          success: false,
          status: 400,
        });
      }
    }

    // // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    const findCustomer = await Customer.findOne({
      $or: [
        { email: trimmedInfo },
        { userName: { $regex: `^${trimmedInfo}$`, $options: 'i' } },
      ],
    });

    if (!findCustomer) {
      return res.json({
        error: 'Customer not found',
        success: false,
        status: 404,
      });
    }

    if (findCustomer.isVerified !== true) {
      let link;
      let token;
      let type = 'customer';
      let sendToken;
      let sendLink;

      const findToken = await Token.findOne({
        $and: [{ userId: findCustomer._id }, { purpose: 'Email verification' }],
      });

      if (findToken) {
        if (device === 'web') {
          link = `${process.env.FRONTEND_URL}/email-verification?userId=${findToken.userId}&token=${findToken.token}&type=${type}`;
        } else if (device === 'mobile') {
          token = findToken.token;
        }
      } else if (!findToken) {
        token = generateRandomPin(6);

        const newToken = new Token({
          token,
          userId: findCustomer._id,
          purpose: 'Email verification',
        });

        await newToken.save();
        link = `${process.env.FRONTEND_URL}/email-verification?userId=${newToken.userId}&token=${newToken.token}&type=${type}`;
      }

      if (device === 'mobile') {
        sendToken = await sendEmailVerificationMobile(
          findCustomer.email,
          findCustomer.firstName,
          token
        );
      } else if (device === 'web') {
        sendLink = await sendEmailVerificationWeb(
          findCustomer.email,
          findCustomer.firstName,
          link
        );
      }

      if (sendLink || sendToken) {
        return res.json({
          error: 'Verification message has been sent to your email address',
          status: 400,
          success: false,
        });
      }
    } else {
      const { password: hashedPassword, ...others } = findCustomer._doc;
      // generate access token based on device
      if (device === 'web') {
        const userAuth = await authUser(
          res,
          findCustomer._id,
          findCustomer.email,
          device
        );
        console.log('userAuth: ' + userAuth);
        return res.json({
          message: 'Login Successful',
          success: true,
          status: 200,
          customer: { others, userAuth },
        });
      } else if (device === 'mobile') {
        const userAuth = await authUser(
          res,
          findCustomer._id,
          findCustomer.email,
          device
        );
        return res.json({
          message: 'Login Successful',
          success: true,
          status: 200,
          customer: { others, userAuth },
        });
      }
    }
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      status: 500,
    });
  }
};

// const regUser = async (req, res, next) => {
//   try {
//   } catch (error) {
//     return res.json({
//       error: error.message,
//       success: false,
// status: 500
//     });
//   }
// };

export { regCustomer, verifyCustomer, loginCustomer };
