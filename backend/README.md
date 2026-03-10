<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

University Idea Management System backend — [NestJS](https://github.com/nestjs/nest) 11+ application with a standardized, modular structure.

### Project structure (NestJS 11+)

```
src/
├── common/           # Shared utilities, pipes, decorators, filters
├── core/             # Core infrastructure (config, logging)
├── modules/          # Feature modules (domain-driven)
│   └── health/       # Health/root endpoint
├── app.module.ts     # Root module
└── main.ts           # Bootstrap
```

- **Feature-first**: Each feature lives under `modules/<feature>` with its controller, service, and module.
- **API prefix**: All routes are under `/api` (e.g. `GET /api`).
- **Global ValidationPipe**: Whitelist, transform, and forbid non-whitelisted payloads (add `class-validator` when using DTOs).

## Project setup

```bash
$ npm install
```

### Database migrations (Neon / connection pooler)

If you use **Neon** (or any connection pooler) and see **P1002** (advisory lock timeout) when running `npx prisma migrate deploy`, run migrations with a **direct** (non-pooled) connection:

1. In Neon Console → **Connect** → choose **Direct connection** and copy the URL.
2. Set `DIRECT_URL` in `.env` to that URL (or pass it only when running migrate).
3. Run migrate: `npx prisma migrate deploy`  
   Prisma config uses `DIRECT_URL` when set, otherwise `DATABASE_URL`. The app always uses `DATABASE_URL` (pooled) at runtime.

Alternatively, derive the direct URL from your pooled URL by removing `-pooler` from the host (e.g. `ep-xxx-pooler.region.aws.neon.tech` → `ep-xxx.region.aws.neon.tech`).

### Redis & notifications (Email + In-app)

To enable notification emails and in-app notifications:

1. Set `REDIS_ENABLED=true` (or `1`).
2. Set `REDIS_URL` — e.g. `rediss://default:PASSWORD@ENDPOINT.upstash.io:6379` for Upstash, or `redis://localhost:6379` for local Redis.
3. Configure SMTP (e.g. `SMTP_*` or `MAIL_*` vars) so emails can be sent.

When Redis is disabled, notifications (email and in-app) are not sent. Export jobs use a DB-based queue and do not require Redis.

**Brevo SMTP:** Get credentials at [app.brevo.com/settings/keys/smtp](https://app.brevo.com/settings/keys/smtp) — use SMTP login + SMTP key (not API key). Verify sender/domain in Brevo; set `SMTP_FROM` to a verified address.

**Upstash billing:** The queue is tuned for low command usage (`stalledInterval` 5 min, `drainDelay` 10 s, `removeOnComplete`, limited failed-job retention).

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Security & compliance

- **Token reuse detection**: On `/auth/refresh`, if the refresh token is not found (already rotated), the backend revokes the entire refresh-token family for that user and returns 401. This mitigates token theft: reuse of an old refresh token forces logout on all devices.
- **User active status**: Both `/auth/login` and `/auth/refresh` check `user.isActive`. Deactivated users cannot log in or refresh; they must be reactivated by an admin.
- **Access token lifespan**: Access tokens are short-lived (default 15 minutes, `JWT_ACCESS_EXPIRES`). Role/department changes made by an admin take effect after the user’s access token expires, minimizing JWT lag.
- **Pagination**: List endpoints use offset pagination (`skip`/`take`). For tables expected to exceed ~100k records, consider cursor-based pagination (e.g. by `id` or `createdAt`) for O(1) performance when jumping to later pages.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
