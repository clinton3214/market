require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // import the model (it's TS, so we might need to use ts-node or just create a raw mongoose model to test schema validation)
}
test().catch(console.error).finally(() => process.exit(0));
