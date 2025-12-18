import { Pool } from 'pg';
import { env } from '../src/lib/env/server';

const databaseUrl = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
});

async function removeDuplicates() {
  const client = await pool.connect();

  try {
    // Find duplicates
    const duplicates = await client.query(`
      SELECT user_id, youtube_id, COUNT(*), array_agg(id) as ids
      FROM user_videos
      GROUP BY user_id, youtube_id
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${duplicates.rows.length} duplicate groups`);

    if (duplicates.rows.length === 0) {
      console.log('No duplicates to remove');
      return;
    }

    // Delete duplicates, keeping the one with the lowest id
    const result = await client.query(`
      DELETE FROM user_videos a
      USING user_videos b
      WHERE a.id > b.id
        AND a.user_id = b.user_id
        AND a.youtube_id = b.youtube_id
    `);

    console.log(`Deleted ${result.rowCount} duplicate rows`);
  } finally {
    client.release();
    await pool.end();
  }
}

removeDuplicates()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
