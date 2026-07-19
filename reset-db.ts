import dbConnect from './lib/mongodb';
import User from './models/User';

async function resetDB() {
  console.log('Connecting to database...');
  await dbConnect();
  
  console.log('Deleting all users...');
  const result = await User.deleteMany({});
  
  console.log(`Successfully deleted ${result.deletedCount} users.`);
  process.exit(0);
}

resetDB().catch((err) => {
  console.error('Error resetting database:', err);
  process.exit(1);
});
