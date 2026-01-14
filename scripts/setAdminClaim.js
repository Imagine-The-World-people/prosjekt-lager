const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Usage:
 *  node scripts/setAdminClaim.js <uid|email> [--remove]
 *
 * Examples:
 *  node scripts/setAdminClaim.js user-12345
 *  node scripts/setAdminClaim.js ola.nordmann@elev.tromsfylke.no
 *  node scripts/setAdminClaim.js user-12345 --remove
 */

async function main() {
  const target = process.argv[2];
  const flag = process.argv[3];

  if (!target) {
    console.error('Usage: node scripts/setAdminClaim.js <uid|email> [--remove]');
    process.exit(1);
  }

  try {
    let uid = target;
    if (target.includes('@')) {
      const user = await admin.auth().getUserByEmail(target);
      uid = user.uid;
    }

    if (flag === '--remove') {
      await admin.auth().setCustomUserClaims(uid, null);
      console.log('Removed admin claim for', uid);
    } else {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log('Set admin claim for', uid);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();