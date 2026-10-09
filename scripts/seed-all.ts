import { seedPaymentSettings } from './seed-payment-settings';
import { seedTransactions } from './seed-transactions';

async function seedAll() {
  console.log('🌱 Starting database seeding...\n');

  try {
    console.log('📋 Seeding payment settings...');
    await seedPaymentSettings();
    console.log('✅ Payment settings seeded\n');

    console.log('💳 Seeding transactions...');
    await seedTransactions();
    console.log('✅ Transactions seeded\n');

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedAll };