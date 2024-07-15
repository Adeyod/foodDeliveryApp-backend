import User from '../models/userModel.js';
import { forbiddenCharsRegex } from '../utils/middlewares.js';

const regCustomer = async (req, res, next) => {
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
    } = req.body;

    if (
      !phoneNumber ||
      !email ||
      !firstName ||
      !lastName ||
      !userName ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedUserName = userName.trim();

    if (forbiddenCharsRegex.test(trimmedFirstName)) {
      return res.status(400).json({
        success: false,
        error: 'Forbidden characters in input field for first name.',
      });
    }

    if (forbiddenCharsRegex.test(trimmedLastName)) {
      return res.status(400).json({
        success: false,
        error: 'Forbidden characters in input field for last name.',
      });
    }

    if (forbiddenCharsRegex.test(trimmedUserName)) {
      return res.status(400).json({
        success: false,
        error: 'Forbidden characters in input field for user name.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({
        message: 'Invalid input for email...',
        success: false,
      });
    }

    // // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.status(401).json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Password and confirm password do not match',
        success: false,
      });
    }

    const userExist = await User.findOne({
      $or: [{ userName: trimmedUserName }, { email: trimmedEmail }],
    });

    if (userExist) {
      let errorField;
      if (userExist.userName === trimmedUserName) {
        errorField = 'userName';
      } else if (userExist.email === trimmedEmail) {
        errorField = 'email';
      }
      return res.status(400).json({
        error: `User already exists with this ${errorField}`,
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
    });
  }
};

// const regUser = async (req, res, next) => {
//   try {
//   } catch (error) {
//     return res.status(500).json({
//       error: error.message,
//       success: false,
//     });
//   }
// };

// const regUser = async (req, res, next) => {
//   try {
//   } catch (error) {
//     return res.status(500).json({
//       error: error.message,
//       success: false,
//     });
//   }
// };

// const regUser = async (req, res, next) => {
//   try {
//   } catch (error) {
//     return res.status(500).json({
//       error: error.message,
//       success: false,
//     });
//   }
// };

export { regUser };
