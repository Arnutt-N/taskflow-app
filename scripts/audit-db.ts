import mysql from 'mysql2/promise';

async function audit() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '41k19UWBa1eSwTx.root',
    password: '0qAoT86Ouy8MC0FO',
    database: 'taskflow',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });
  
  console.log('=== DATABASE AUDIT REPORT ===\n');
  
  // Check for departments and teams tables
  const [deptTables] = await conn.execute("SHOW TABLES LIKE 'departments'");
  console.log('1. DEPARTMENTS TABLE:', deptTables.length > 0 ? 'EXISTS ✓' : 'MISSING ✗');
  
  const [teamTables] = await conn.execute("SHOW TABLES LIKE 'teams'");
  console.log('2. TEAMS TABLE:', teamTables.length > 0 ? 'EXISTS ✓' : 'MISSING ✗');
  
  // Check prisma migrations
  const [migrations]: any = await conn.execute('SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at');
  console.log('\n3. PRISMA MIGRATIONS:');
  if (migrations.length === 0) {
    console.log('   No migrations found');
  } else {
    migrations.forEach((m: any) => {
      const status = m.finished_at ? `✓ applied (${m.finished_at})` : '⏳ pending';
      console.log(`   - ${m.migration_name}: ${status}`);
    });
  }
  
  // Check User table structure
  const [userCols]: any = await conn.execute('DESCRIBE users');
  console.log('\n4. USERS TABLE STRUCTURE (relevant columns):');
  const relevantCols = ['department_id', 'team_id', 'role'];
  userCols.forEach((c: any) => {
    if (relevantCols.includes(c.Field)) {
      console.log(`   - ${c.Field}: ${c.Type} ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }
  });
  
  // Check foreign keys on users table
  console.log('\n5. FOREIGN KEY CONSTRAINTS ON users TABLE:');
  try {
    const [fks]: any = await conn.execute(`
      SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'taskflow' 
      AND TABLE_NAME = 'users'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    if (fks.length === 0) {
      console.log('   No foreign key constraints found');
    } else {
      fks.forEach((fk: any) => {
        console.log(`   - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
      });
    }
  } catch(e: any) {
    console.log('   Could not retrieve FK info:', e.message);
  }
  
  // Check all tables
  const [allTables]: any = await conn.execute('SHOW TABLES');
  console.log('\n6. ALL TABLES IN DATABASE:');
  allTables.forEach((t: any) => {
    const tableName = Object.values(t)[0];
    console.log(`   - ${tableName}`);
  });
  
  await conn.end();
  console.log('\n=== END OF AUDIT ===');
}

audit().catch(console.error);
