# NodeJS Booking App

An appointment booking server built with Node.js and Express, backed by the Google Calendar API. Appointments are 40 minutes long with a 5-minute break between them, bookable Monday–Friday from 9am to 6pm. Timeslots are easily customizable — just edit `Utility/timeslots.json`.

## Booking rules

- Appointments are 40 minutes long with fixed start times (9:00, 9:45, 10:30, …).
- A 5-minute break separates each appointment.
- Bookings are only accepted on weekdays, 9am to 6pm.
- Bookings must be made at least 24 hours in advance.
- Past times cannot be booked.

## Requirements

- Node.js 18 or newer
- A Google Cloud project with the Google Calendar API enabled
- An OAuth 2.0 **Desktop app** client (see setup below)

## Setup

1. **Clone and install**

   ```sh
   git clone https://github.com/AryanNateq/NodeJS-Booking-App.git
   cd NodeJS-Booking-App
   npm install
   ```

2. **Create an OAuth Desktop client**

   - Go to the [Google Cloud Console Credentials page](https://console.cloud.google.com/apis/credentials).
   - Enable the Google Calendar API for your project.
   - Create an **OAuth 2.0 Client ID** with application type **Desktop app**.
   - Download the credentials JSON and save it as `Utility/credentials.json`.

3. **(Optional) Configure the port**

   Copy `.env.example` to `.env` and adjust `PORT` if you want something other than `8080`.

4. **Start the server**

   ```sh
   npm start
   ```

   On first run, a browser window opens for Google authorization. After you approve, the server captures the callback automatically and stores refresh credentials in `Utility/token.json`. Subsequent runs use that token — no re-authorization needed unless you delete it or change scopes.

## HTTP API

```
GET  /days?year=YYYY&month=MM
GET  /timeslots?year=YYYY&month=MM&day=DD
POST /book?year=YYYY&month=MM&day=DD&hour=HH&minute=MM
```

All responses are JSON. On validation or API errors the response has the shape `{ "success": false, "message": "..." }` and an appropriate HTTP status.

### Examples

List bookable days in a month:

```sh
curl "http://localhost:8080/days?year=2026&month=5"
```

List available timeslots for a day:

```sh
curl "http://localhost:8080/timeslots?year=2026&month=5&day=7"
```

Book an appointment:

```sh
curl -X POST "http://localhost:8080/book?year=2026&month=5&day=7&hour=10&minute=30"
```

## Project layout

```
server.js                        Express entrypoint; wires routes and auth
ReqHandlers/
  GET-Handlers/days.js           GET /days      — bookable days in a month
  GET-Handlers/timeslots.js      GET /timeslots — available slots in a day
  POST-Handlers/book.js          POST /book     — creates a calendar event
Utility/
  gcal.js                        Google OAuth + loopback auth flow
  appUtil.js                     Date and event helpers
  requirement-validator.js       Request parameter validation
  timeslots.json                 Daily timeslot definitions (edit to customize)
  credentials.json               Your OAuth client (gitignored)
  token.json                     Generated on first run  (gitignored)
```

## Customizing timeslots

The set of daily timeslots lives in `Utility/timeslots.json`. Each entry has a `startTime` and `endTime` in the form `"THH:MM:SSZ"` (UTC). The booking rules (weekdays only, 9am–6pm) are enforced in `Utility/requirement-validator.js`.

## License

Copyright © 2019 Aryan Nateghnia. Released under the GPL v3.0. See [`LICENSE`](LICENSE) for details.
