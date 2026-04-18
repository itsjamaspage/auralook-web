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
    const body = await req.json();
    const { lookId, stars, text, anonymous, photoUrl, userId, telegramId, telegramUsername, telegramPhoto, displayName } = body;

    if (!lookId || !stars || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = getFirebaseAdmin();
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
