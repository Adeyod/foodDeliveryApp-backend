import mongoose from 'mongoose';

const imageUpload = {
  publicId: String,
  signature: String,
  url: String,
  assetId: String,
};

const bikerSchema = new mongoose.Schema(
  {
    phoneNumber: { type: Number, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    referralCode: { type: String, required: true },
    password: { type: String, required: true },
    bikeRegNumber: { type: Number, required: true },
    bikeModel: { type: String, required: true },
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

const Biker = mongoose.model('Biker', bikerSchema);
export default Biker;

// const Biker = User.discriminator('Biker', bikerSchema);
