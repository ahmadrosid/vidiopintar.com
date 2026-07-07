import { paymentSettingsRepository } from '../src/lib/db/repository/payment-settings';

async function seedPaymentSettings() {
  try {
    // Check if settings already exist
    const existingSettings = await paymentSettingsRepository.getActive();
    
    if (existingSettings) {
      console.log('Payment settings already exist, skipping seed...');
      return;
    }

    // Create default payment settings
    const defaultSettings = {
      bankName: 'BNI',
      bankAccountNumber: '1229085831',
      bankAccountName: 'Ahmad Rosid',
      whatsappPhoneNumber: '6281234567890',
      whatsappMessageTemplate: 'Halo, saya sudah melakukan transfer untuk {planName} sebesar {planPrice}. Mohon konfirmasi pembayaran saya.'
    };

    const result = await paymentSettingsRepository.create(defaultSettings);
    console.log('Default payment settings created:', result);
  } catch (error) {
    console.error('Error seeding payment settings:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedPaymentSettings()
    .then(() => {
      console.log('Payment settings seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedPaymentSettings };