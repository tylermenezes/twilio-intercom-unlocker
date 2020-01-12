A tiny service that responds to Twilio calls coming from a building intercom system, and either unlocks the door
immediately, or forwards the call to other phones.

# Environment Variables

| Variable          | Default   | Description                                                                                                                                         |
|-------------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| PORT              | 8000      | The port to listen (http) on.                                                                                                                       |
| DATA_DIR          | /config   | The location to store config files in. Should be set to a volume to maintain locked-state across reboots.                                           |
| DIGITS            | 999999999 | The digits you need to press on your cell phone to unlock the door.                                                                                 |
| PHONES            |           | Comma-separated list of phone numbers which, if set, will receive calls if the door is locked.  If unset, the intercom will play a "sorry" message. |
| SECRET            | changeme  | A shared secret which must be passed to `/set` to set the locked status.                                                                            |
| TWILIO_AUTH_TOKEN |           | If set, Twilio will validate the signature on incoming requests. This can help prevent your phone number from leaking.                              |

# Locking/Unlocking The Door

Just make a request to `/set` with `secret` set to your shared secret, and `unlocked` set to true or false.

# Configuring Twilio

Host this somewhere on the internet, and have Twilio make a GET or POST request to `/intercom`
