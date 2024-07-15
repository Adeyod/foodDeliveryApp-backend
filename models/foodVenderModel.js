import mongoose, { Schema } from 'mongoose';

const imageUpload = {
  publicId: String,
  signature: String,
  url: String,
  assetId: String,
};

const foodVendorSchema = new mongoose.Schema(
  {
    phoneNumber: { type: Number, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    referralCode: { type: String, required: true },
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

const FoodVendor = mongoose.model('FoodVendor', foodVendorSchema);
export default FoodVendor;

// How to use mongoDB discriminator for connecting two different database collections.
