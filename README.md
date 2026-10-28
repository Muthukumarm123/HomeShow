# Cinema Family Movie Night & Ticket Booking Engine

A cinematic, mobile-first web application designed for private family movie nights, premiere screenings, and community events with challenge-based gating, ticket approvals, and phone-based camera QR code verification.

---

## 🌟 Key Capabilities

1. **Multi-Website & Multi-Movie Support**
   - Use this single codebase for **any number of movie screening websites** (e.g. *Jailer 2*, *Leo*, *Coolie*, *Avatar 3*, or custom family movie nights).
   - Easily switch active movie presets with one click in the Admin Console under **Multi-Website & GitHub**.
   - Create brand-new movie websites with custom titles, posters, YouTube trailers, venues, and challenge rules (UNO, Trivia, Mario Kart, etc.).

2. **GitHub Pages Ready (Zero-Cost Hosting)**
   - Includes **Dual-Persistence**: works with a full-stack Node.js/Express server or **100% statically on GitHub Pages** using client-side storage.
   - Built-in GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated zero-cost deployment on every git push.
   - Configured with `base: './'` in `vite.config.ts` so your site loads smoothly at `https://<username>.github.io/<repository-name>/`.

3. **Administrator Password Management & Recovery**
   - **Change Password**: Open the Admin Console and click **Change Password** (in the top bar or settings tab).
   - **Emergency Password Recovery Key**: If you ever forget your password, you can use the master recovery key `FAMILY-CINEMA-2026` to safely set a new password without losing access.
   - Default initial password: `jailer2026`.

4. **Challenge-Based Ticket Gating**
   - Enforces a 1-ticket-per-attendee policy.
   - Waiting list requests start at `PENDING`.
   - Organiser verifies challenge rounds (e.g. Game 1 and Game 2).
   - Once both rounds are verified, status automatically becomes `AWAITING APPROVAL`.
   - Organiser approves and issues the pass with a cryptographic QR code.

5. **Phone-Based Camera QR Scanner**
   - Admin uses their smartphone camera to scan tickets at the door.
   - Displays a green verified confirmation screen with attendee name and ticket ID.
   - Atomic check-in prevents duplicate entries and records check-in timestamps.

---

## 🚀 How to Publish to GitHub Pages

1. **Create a GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Cinema Movie Night System"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in GitHub**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages** (under Code and automation).
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - The included workflow `.github/workflows/deploy.yml` will automatically build and publish your site!

---

## 🔑 Default Credentials

- **Admin Username**: `admin`
- **Default Master Password**: `jailer2026`
- **Master Emergency Recovery Key**: `FAMILY-CINEMA-2026`
