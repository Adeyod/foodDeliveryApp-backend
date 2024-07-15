import mongoose from 'mongoose';

const referralCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

const ReferralCode = mongoose.model('ReferralCode', referralCodeSchema);

export default ReferralCode;
