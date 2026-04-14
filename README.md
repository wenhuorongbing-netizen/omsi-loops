# Idle Loops

This repository is a static web game. You do not need a traditional backend server just to make it playable from the internet.

## Local Development

Open the repo in VS Code and start the local static server from the integrated terminal:

```powershell
npm run serve
```

Then open:

```text
http://127.0.0.1:5500
```

This project loads assets over HTTP, so opening `index.html` directly with `file://` is not enough.

## Fastest Way To Share It From VS Code

If you want to keep the game running on your own machine and let other people open it from the internet:

1. Start the game locally with `npm run serve`.
2. In VS Code, open the `Ports` view.
3. Forward port `5500`.
4. Change that forwarded port to `Public`.
5. Copy the forwarded address and send it to other people.

Notes:

- VS Code port forwarding is built in and uses Microsoft dev tunnels.
- Forwarded ports are `Private` by default, which means the visitor must sign in with the same account. Change it to `Public` if you want anyone with the link to access it.
- This is good for testing and demos. Your computer must stay on, and the game stops being reachable when your local server stops.

## Stable Public Hosting

Because this is a static site, GitHub Pages is the simplest stable public deployment:

1. Push your branch to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings -> Pages`.
4. Choose the branch you want to publish.
5. Save and wait for the site to finish building.

Your public address will usually look like:

```text
https://<your-github-username>.github.io/<repository-name>/
```

For this repository name, that means a URL in the shape of:

```text
https://<your-github-username>.github.io/omsi-loops/
```

## What This Does And Does Not Do

- Visitors can open the game and play it in their own browser.
- Saves are stored per browser with `localStorage`, so players do not share the same save by default.
- If you want real multiplayer, shared rooms, shared saves, matchmaking, or server-authoritative state, that is a later step and will require a backend service.
- Google Drive cloud save may be restricted by OAuth origin settings on temporary forwarded domains.
