# Survive Chaos Online — setup checklist

The Mobile client is already prepared to remain fully offline until public backend values are configured.

## Public Android identity

- App ID: `com.survivechaos.game`
- OAuth callback: `survivechaos://auth/callback`
- Beta signing SHA-256: `BC:1C:BE:0C:09:5A:9A:92:9E:61:14:26:86:0F:92:1C:0F:FF:58:8B:4F:59:24:C9:30:52:CE:C2:D7:2C:F1:1B`
- Online protocol: `sc.online.v1`

## Values that are safe to place in the APK

Edit `mobile-overrides/mobile-online-config.js` only with PUBLIC client values:

- `supabaseUrl`
- `publishableKey` (or legacy anon key)
- `multiplayerUrl`
- `enabled: true`

Never put `service_role`, database passwords, Google client secret, Railway secret values, signing keystore passwords, or private API keys in this file.

## Supabase

1. Create a project.
2. Open SQL Editor and run `online/supabase-bootstrap.sql`.
3. Enable Google provider under Authentication.
4. Add `survivechaos://auth/callback` to the allowed redirect URLs.
5. Copy the Project URL and Publishable key for the Mobile public config.
6. Sign in once from the app so your auth user/profile exists.
7. Promote the owner account only from SQL Editor or trusted server code by inserting/updating `public.admin_roles`.

## Google OAuth

Create the OAuth app/consent configuration required by Supabase Google Auth. Keep the Google client secret inside Supabase/Google configuration only; never commit it to GitHub or put it in the APK.

## Multiplayer server (later step)

The client already exposes `SCOnline.setTransport(fn)` and emits packets shaped like:

```json
{
  "protocol": "sc.online.v1",
  "requestId": "uuid",
  "type": "room.create",
  "playerId": "auth-user-uuid",
  "roomId": null,
  "payload": {}
}
```

Initial room commands prepared in the client:

- `room.create`
- `room.join`
- `room.leave`
- `room.ready`

When a server transport is attached, `SCAdminBus` is also routed through the online transport so admin commands can become server-authoritative.

## Save migration

The existing local `nsf` save remains the Offline source of truth until the player explicitly chooses a cloud action. The Online screen can preview local coins, owned skins, mastery and run history before migration.
