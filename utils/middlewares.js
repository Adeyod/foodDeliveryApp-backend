import ReferralCode from '../models/referralCodeModel.js';

const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;

const generateRandomPin = (num) => {
  if (num < 1) {
    throw new Error('Number of digits must be atleast 1');
  }

  const min = Math.pow(10, num - 1);

  const max = Math.pow(10, num) - 1;

  return Math.floor(min + Math.random() * (max - min + 1));
};

const createReferralCode = async (trimmedUsername, num, role) => {
  try {
    let code;

    const uniqueId = generateRandomPin(num);

    code = `${trimmedUsername}-${uniqueId}`;

    const uniqueCode = await ReferralCode.findOne({ code });
    if (uniqueCode) {
      code = `${trimmedUsername}-${uniqueId}`;
      await new ReferralCode({ code, role }).save();
    } else {
      // i want to save the first code at the top here
      await new ReferralCode({ code, role }).save();
    }

    return code;
  } catch (error) {
    console.log(error);
  }
};

export { forbiddenCharsRegex, createReferralCode, generateRandomPin };
