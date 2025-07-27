import { transactionsRepository } from '../src/lib/db/repository/transactions';
import { db } from '../src/lib/db';
import { user } from '../src/lib/db/schema/auth';

async function seedTransactions() {
  try {
    // Check if transactions already exist
    const existingTransactions = await transactionsRepository.getAll(1);
    
    if (existingTransactions.length > 0) {
      console.log('Transactions already exist, skipping seed...');
      return;
    }

    // Get existing users from database
    const users = await db.select().from(user).limit(5);
    
    if (users.length === 0) {
      console.log('No users found in database. Please create users first.');
      return;
    }

    const sampleTransactions = [
      // Confirmed monthly transaction
      {
        userId: users[0].id,
        planType: 'monthly' as const,
        amount: 50000,
        currency: 'IDR',
        status: 'confirmed' as const,
        paymentMethod: 'bank_transfer',
        confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      
      // Pending yearly transaction
      {
        userId: users[0].id,
        planType: 'yearly' as const,
        amount: 500000,
        currency: 'IDR',
        status: 'pending' as const,
        paymentMethod: 'bank_transfer',
      },
      
      // Confirmed yearly transaction for different user
      {
        userId: users[1]?.id || users[0].id,
        planType: 'yearly' as const,
        amount: 500000,
        currency: 'IDR',
        status: 'confirmed' as const,
        paymentMethod: 'bank_transfer',
        confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      
      // Cancelled transaction
      {
        userId: users[1]?.id || users[0].id,
        planType: 'monthly' as const,
        amount: 50000,
        currency: 'IDR',
        status: 'cancelled' as const,
        paymentMethod: 'bank_transfer',
      },
      
      // Another pending monthly transaction
      {
        userId: users[2]?.id || users[0].id,
        planType: 'monthly' as const,
        amount: 50000,
        currency: 'IDR',
        status: 'pending' as const,
        paymentMethod: 'bank_transfer',
      },

      // Expired transaction
      {
        userId: users[2]?.id || users[0].id,
        planType: 'monthly' as const,
        amount: 50000,
        currency: 'IDR',
        status: 'expired' as const,
        paymentMethod: 'bank_transfer',
      },
    ];

    console.log(`Creating ${sampleTransactions.length} sample transactions...`);

    for (const transactionData of sampleTransactions) {
      // Generate unique reference for each transaction
      const transactionReference = await transactionsRepository.generateUniqueReference();
      
      const transaction = await transactionsRepository.create({
        ...transactionData,
        transactionReference,
        paymentSettings: JSON.stringify({
          bankName: 'Bank Central Asia (BCA)',
          bankAccountNumber: '1234567890',
          bankAccountName: 'Vidiopintar Indonesia',
        }),
        userAgent: 'Mozilla/5.0 (Seeder Script)',
        ipAddress: '127.0.0.1',
      });

      // Update status and confirmed date if needed
      if (transactionData.status !== 'pending' && transactionData.confirmedAt) {
        await transactionsRepository.updateStatus(
          transaction.id, 
          transactionData.status,
          transactionData.confirmedAt
        );
      } else if (transactionData.status !== 'pending') {
        await transactionsRepository.updateStatus(
          transaction.id, 
          transactionData.status
        );
      }

      console.log(`Created transaction: ${transaction.transactionReference} (${transactionData.status})`);
    }

    console.log('Sample transactions created successfully!');
  } catch (error) {
    console.error('Error seeding transactions:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedTransactions()
    .then(() => {
      console.log('Transaction seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedTransactions };