// Load environment variables before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Export to ensure this runs first when imported
export const ENV_LOADED = true;
