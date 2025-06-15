import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true, 
  logging: false, 
  entities: ["src/models/**/*.ts"],
  migrations: ["src/models/migrations/*.ts"],
  extra: {
    connectionTimeoutMillis: 30000,
  },
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }
    : false, // Adjust SSL for development
  schema: 'public',
});

// Modified initialization function
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established!");
   //   await updateEnumColumnsToUppercase(); // Update enums to uppercase after DB init
      await seedDefaultRoles();
    }
  } catch (error) {
    console.error("Error during database initialization:", error);
  }
};


// Function to update all enum columns to uppercase
// async function updateEnumColumnsToUppercase() {
//   const queryRunner = AppDataSource.createQueryRunner();
//   try {
//     await queryRunner.connect();

//     // List of [table, column] pairs that use enums
//     const enumColumns: [string, string][] = [
//       ['ticket_types', 'ticketCategory'],
//       // Add more as needed: ['table_name', 'enum_column_name']
//     ];

//     for (const [table, column] of enumColumns) {
//       await queryRunner.query(
//         `UPDATE "${table}" SET "${column}" = UPPER("${column}") WHERE "${column}" IS NOT NULL;`
//       );
//     }

//     console.log('All enum columns updated to uppercase.');
//   } catch (error) {
//     console.error('Error updating enum columns to uppercase:', error);
//   } finally {
//     await queryRunner.release();
//   }
// }

// Function to seed default roles
async function seedDefaultRoles() {
  try {
    const roleRepository = AppDataSource.getRepository('Role');
    // Check if GUEST role exists
    const guestRole = await roleRepository.findOne({ where: { roleName: 'GUEST' } });
    if (!guestRole) {
      console.log("Creating default GUEST role...");
      const newRole = roleRepository.create({
        roleName: 'GUEST',
        permissions: ['read:public'],
        description: 'Default role for new users'
      });
      await roleRepository.save(newRole);
      console.log("Default GUEST role created successfully!");
    }
  } catch (error) {
    console.error("Error seeding default roles:", error);
  }
}
