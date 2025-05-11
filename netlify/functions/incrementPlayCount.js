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
    // Transaction kullanarak sayacı güvenli bir şekilde artır
    const { committed, snapshot } = await playCountRef.transaction(currentCount => {
      // Eğer sayaç null (ilk defa) ise 0'dan başlat, değilse mevcut değeri kullan
      return (currentCount || 0) + 1;
    });

    if (!committed) {
      throw new Error('Transaction to increment play count was not committed.');
    }

    const newPlayCount = snapshot.val();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Herhangi bir alan adından erişime izin ver
      },
      body: JSON.stringify({ count: newPlayCount }),
    };
  } catch (error) {
    console.error('Error incrementing play count:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to increment play count', details: error.message }),
    };
  }
};