const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(process.argv[2]);
    console.log('Claims for', user.email, user.customClaims);
  } catch (e) {
    console.error('Error:', e);
  }
})();