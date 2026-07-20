const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://clinton:Chid1234.@travis-pay.dbyddm8.mongodb.net/travis_pay?retryWrites=true&w=majority&appName=travis-pay');
  const ListingSchema = new mongoose.Schema({}, { strict: false });
  const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema, 'listings');
  
  try {
    const found1 = await Listing.findOne({ _id: undefined, status: 'available' });
    console.log('findOne with undefined:', found1 ? 'FOUND' : 'NULL');
  } catch(e) {
    console.log('Error with undefined:', e.message);
  }

  try {
    const found2 = await Listing.findOne({ _id: null, status: 'available' });
    console.log('findOne with null:', found2 ? 'FOUND' : 'NULL');
  } catch(e) {
    console.log('Error with null:', e.message);
  }

  process.exit(0);
}

run().catch(console.error);
