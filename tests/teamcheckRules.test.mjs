import test from 'node:test';
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let draait = false;
try { draait = (await fetch('http://127.0.0.1:8080/')).status < 500; } catch { /* De losse suite meldt de overgeslagen beveiligingstest. */ }

// Wat hier wordt nagerekend is geen gedrag van het scherm maar een belofte aan
// negen mensen: je collega leest jouw antwoord niet. Een scherm dat iets niet
// toont, is geen bewijs -- wie de app omzeilt en rechtstreeks de database
// bevraagt, hoort precies hetzelfde te krijgen. Dat is wat deze tests meten.
test('teamcheck: wie wat mag lezen en schrijven', { skip: !draait }, async (t) => {
  const env = await initializeTestEnvironment({
    projectId: 'teamcheck-regeltest',
    firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync('firestore.rules', 'utf8') },
  });
  const pad = 'organisaties/organisatie/teams/evides';
  const db = (uid) => (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());
  const antwoordRef = (d, ronde, uid) => doc(d, `${pad}/teamcheck/${ronde}/antwoorden/${uid}`);
  const rondeRef = (d, ronde) => doc(d, `${pad}/teamcheck/${ronde}`);
  const ingevuld = (extra = {}) => ({
    scores: { duidelijkheid: 4, toepassing: 3, eigenaarschap: 3, bespreekbaarheid: 2, opbrengst: 4 },
    open: 'Het weekoverleg helpt.',
    naamErbij: false,
    ingevuldOp: serverTimestamp(),
    ...extra,
  });

  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d = ctx.firestore();
      for (const [uid, rol] of [['bo', 'begeleider'], ['ed', 'lid'], ['marleen', 'lid'], ['joost', 'lid'], ['teambaas', 'beheerder']]) {
        await setDoc(doc(d, `${pad}/leden/${uid}`), { rol });
      }
      await setDoc(doc(d, 'organisaties/organisatie/teams/ander/leden/buitenstaander'), { rol: 'beheerder' });
      // Bo en Ed zijn de twee aangewezen begeleiders van deze omgeving.
      await setDoc(doc(d, `${pad}/teamomgeving/toegang`), { beheerders: ['bo', 'ed'], aangemaaktDoor: 'bo', versie: 1 });
    });

    await t.test('een teamlid kan geen ronde openen', async () => {
      await assertFails(setDoc(rondeRef(db('marleen'), 'd30'), { status: 'open', versie: 1, geopendOp: serverTimestamp(), geopendDoor: 'marleen' }));
      await assertFails(setDoc(rondeRef(db('teambaas'), 'd30'), { status: 'open', versie: 1, geopendOp: serverTimestamp(), geopendDoor: 'teambaas' }));
    });

    await t.test('een begeleider opent de ronde', async () => {
      await assertSucceeds(setDoc(rondeRef(db('bo'), 'd30'), { status: 'open', versie: 1, geopendOp: serverTimestamp(), geopendDoor: 'bo' }));
    });

    await t.test('een verzonnen ronde bestaat niet', async () => {
      await assertFails(setDoc(rondeRef(db('bo'), 'd45'), { status: 'open', versie: 1, geopendOp: serverTimestamp(), geopendDoor: 'bo' }));
    });

    await t.test('je vult in op je eigen naam, niet op die van een ander', async () => {
      await assertSucceeds(setDoc(antwoordRef(db('marleen'), 'd30', 'marleen'), ingevuld()));
      await assertFails(setDoc(antwoordRef(db('marleen'), 'd30', 'joost'), ingevuld()));
      // Ook een begeleider vult niet namens iemand anders in.
      await assertFails(setDoc(antwoordRef(db('bo'), 'd30', 'joost'), ingevuld()));
    });

    await t.test('een collega leest jouw antwoord niet -- ook niet buiten de app om', async () => {
      await assertFails(getDoc(antwoordRef(db('joost'), 'd30', 'marleen')));
      await assertFails(getDoc(antwoordRef(db('teambaas'), 'd30', 'marleen')));
      await assertFails(getDocs(collection(db('joost'), `${pad}/teamcheck/d30/antwoorden`)));
      await assertFails(getDocs(collection(db('teambaas'), `${pad}/teamcheck/d30/antwoorden`)));
    });

    await t.test('je leest wel je eigen antwoord terug', async () => {
      await assertSucceeds(getDoc(antwoordRef(db('marleen'), 'd30', 'marleen')));
    });

    await t.test('de twee begeleiders lezen alles, want anders is er geen teambeeld', async () => {
      for (const uid of ['bo', 'ed']) {
        await assertSucceeds(getDoc(antwoordRef(db(uid), 'd30', 'marleen')));
        await assertSucceeds(getDocs(collection(db(uid), `${pad}/teamcheck/d30/antwoorden`)));
      }
    });

    await t.test('een ander team en een gast komen er niet in', async () => {
      for (const uid of ['buitenstaander', null]) {
        await assertFails(getDoc(antwoordRef(db(uid), 'd30', 'marleen')));
        await assertFails(getDocs(collection(db(uid), `${pad}/teamcheck/d30/antwoorden`)));
        await assertFails(setDoc(antwoordRef(db(uid), 'd30', uid || 'gast'), ingevuld()));
      }
    });

    await t.test('een naam komt er alleen in als je er zelf voor koos', async () => {
      await assertFails(setDoc(antwoordRef(db('joost'), 'd30', 'joost'), ingevuld({ naam: 'Joost', naamErbij: false })));
      await assertSucceeds(setDoc(antwoordRef(db('joost'), 'd30', 'joost'), ingevuld({ naam: 'Joost', naamErbij: true })));
    });

    await t.test('een verzonnen stelling of veld komt er niet in', async () => {
      await assertFails(setDoc(antwoordRef(db('marleen'), 'd30', 'marleen'),
        ingevuld({ scores: { duidelijkheid: 4, verzonnen: 5 } })));
      await assertFails(setDoc(antwoordRef(db('marleen'), 'd30', 'marleen'),
        ingevuld({ oordeelOverCollega: 'onvoldoende' })));
    });

    await t.test('een open antwoord kent een bovengrens', async () => {
      await assertFails(setDoc(antwoordRef(db('marleen'), 'd30', 'marleen'), ingevuld({ open: 'x'.repeat(2001) })));
      await assertSucceeds(setDoc(antwoordRef(db('marleen'), 'd30', 'marleen'), ingevuld({ open: 'x'.repeat(2000) })));
    });

    await t.test('je trekt je eigen inzending in, een begeleider niet voor jou', async () => {
      await assertFails(deleteDoc(antwoordRef(db('bo'), 'd30', 'marleen')));
      await assertFails(deleteDoc(antwoordRef(db('joost'), 'd30', 'marleen')));
      await assertSucceeds(deleteDoc(antwoordRef(db('marleen'), 'd30', 'marleen')));
    });

    await t.test('een gesloten ronde neemt niets meer aan', async () => {
      await assertSucceeds(setDoc(rondeRef(db('bo'), 'd30'), { status: 'gesloten', versie: 1, geopendOp: serverTimestamp(), geopendDoor: 'bo' }));
      await assertFails(setDoc(antwoordRef(db('joost'), 'd30', 'joost'), ingevuld()));
      await assertFails(deleteDoc(antwoordRef(db('joost'), 'd30', 'joost')));
      // Lezen kan nog wel: je eigen antwoord blijft van jou.
      await assertSucceeds(getDoc(antwoordRef(db('joost'), 'd30', 'joost')));
    });

    await t.test('invullen in een ronde die nooit is geopend, kan niet', async () => {
      await assertFails(setDoc(antwoordRef(db('joost'), 'd90', 'joost'), ingevuld()));
    });

    await t.test('een ronde kan niet worden weggegooid', async () => {
      await assertFails(deleteDoc(rondeRef(db('bo'), 'd30')));
    });
  } finally {
    await env.cleanup();
  }
});
