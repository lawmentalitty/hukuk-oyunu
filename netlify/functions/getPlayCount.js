const admin = require('firebase-admin');

// Firebase Admin SDK'sını yalnızca bir kez başlat
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Önemli: \n karakterlerini düzelt
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();
const playCountRef = db.ref('playCount');

exports.handler = async function(event, context) {
  try {
    const snapshot = await playCountRef.once('value');
    const playCount = snapshot.val() || 0; // Eğer değer null ise 0 olarak kabul et

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Herhangi bir alan adından erişime izin ver (geliştirme için)
      },
      body: JSON.stringify({ count: playCount }),
    };
  } catch (error) {
    console.error('Error fetching play count:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to fetch play count' }),
    };
  }
};