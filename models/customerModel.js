import mongoose, { Schema } from 'mongoose';

const imageUpload = {
  publicId: String,
  signature: String,
  url: String,
  assetId: String,
};

const customerSchema = new mongoose.Schema(
  {
    phoneNumber: { type: Number, required: true },
    isVerified: { type: Boolean, required: true, default: false },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    myReferralCode: { type: String, required: true },
    password: { type: String, required: true },
    image: imageUpload,
    referredCustomers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    ],
    referredBikers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Biker' }],
    referredFoodVendors: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'FoodVendor' },
    ],
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
