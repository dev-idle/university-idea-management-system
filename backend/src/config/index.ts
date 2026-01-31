/**
 * Application configuration: bootstrap options, constants, and shared config.
 */

export {
  API_PREFIX,
  DEFAULT_PORT,
  configureApp,
  type ConfigureAppOptions,
} from './app.config';
export { envSchema, type Env } from './env.schema';
export { validateEnv } from './configuration';
