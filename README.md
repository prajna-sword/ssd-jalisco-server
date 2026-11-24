Stripe CLI Listen Command
```
stripe listen \
  --all-snapshot \
  --forward-to localhost:3000/webhook/platform \
  --forward-connect-to localhost:3000/webhook/connect
```