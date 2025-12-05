const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // last ned fra Firebase Console

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const email = process.argv[2];
if (!email) { console.error('Usage: node setAdminClaim.js user@example.com'); process.exit(1); }

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Set admin claim for ${email}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();