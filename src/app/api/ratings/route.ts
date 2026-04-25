import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function serializeDoc(data: FirebaseFirestore.DocumentData) {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  const lookId = req.nextUrl.searchParams.get('lookId');
  if (!lookId) return NextResponse.json({ error: 'lookId required' }, { status: 400 });

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const snapshot = await db
      .collection('looks')
      .doc(lookId)
      .collection('ratings')
      .orderBy('createdAt', 'desc')
      .get();

    const ratings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    return NextResponse.json({ ratings });
  } catch (e) {
    console.error('[ratings GET]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase ID token — prevents unauthenticated actors from writing ratings
    const authorization = req.headers.get('Authorization');
    const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getFirebaseAdmin();

    let decodedToken: { uid: string };
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { lookId, stars, text, anonymous, photoUrl, userId, telegramId, telegramUsername, telegramPhoto, displayName } = body;

    if (!lookId || !stars || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // userId in body must match the verified Firebase UID
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = admin.firestore();

    await db.collection('looks').doc(lookId).collection('ratings').add({
      userId,
      telegramId: telegramId ?? null,
      telegramUsername: telegramUsername ?? null,
      telegramPhoto: telegramPhoto ?? null,
      displayName: displayName ?? null,
      anonymous: anonymous ?? false,
      stars: Number(stars),
      text: text || '',
      photoUrl: photoUrl ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('looks').doc(lookId).set(
      {
        ratingCount: admin.firestore.FieldValue.increment(1),
        ratingSum: admin.firestore.FieldValue.increment(Number(stars)),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[ratings POST]', e);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
