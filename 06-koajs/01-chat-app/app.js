const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = {};

router.get('/subscribe', async (ctx, next) => {
  const id = ctx.request.query.r || Math.random();

  subscribers[id] = ctx;

  ctx.req.on('close', (err) => {
    delete subscribers[id];
  });

  await new Promise((resolve) => {});
});

router.post('/publish', async (ctx, next) => {
  if (!ctx.request.body.message) return;
  // eslint-disable-next-line guard-for-in
  for (const id in subscribers) {
    const ctx_ = subscribers[id];
    ctx_.status = 200;
    ctx_.res.end(ctx.request.body.message);
  }

  ctx.status = 200;
  subscribers = {};
});

app.use(router.routes());

module.exports = app;
