import test from 'node:test';
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
let draait = false;
try { draait = (await fetch('http://127.0.0.1:8080/')).status < 500; } catch { /* De losse suite meldt de overgeslagen beveiligingstest. */ }
test('teamomgeving: toegang en scheiding in Firestore', { skip: !draait }, async (t) => {
  const env = await initializeTestEnvironment({ projectId:'teamomgeving-regeltest',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.rules','utf8')} });
  const pad='organisaties/organisatie/teams/evides';
  const db = (uid) => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
  const r = (d,id) => doc(d,`${pad}/teamomgeving/${id}`);
  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d=ctx.firestore();
      for (const [uid,rol] of [['bo','begeleider'],['ed','lid'],['lid','lid'],['andere-beheerder','beheerder']]) await setDoc(doc(d,`${pad}/leden/${uid}`),{rol});
      await setDoc(doc(d,'organisaties/organisatie/teams/ander/leden/buitenstaander'),{rol:'beheerder'});
    });
    await t.test('gewoon teamlid mag inrichting niet starten', async () => {
      await assertFails(setDoc(r(db('lid'),'toegang'),{beheerders:['lid','ed'],aangemaaktDoor:'lid',versie:1}));
    });
    await t.test('geen niet-lid als tweede begeleider', async () => {
      await assertFails(setDoc(r(db('bo'),'toegang'),{beheerders:['bo','buitenstaander'],aangemaaktDoor:'bo',versie:1}));
    });
    await t.test('inhoud, toegang en pdf atomisch inrichten', async () => {
      const d=db('bo'); const batch=writeBatch(d);
      batch.set(r(d,'toegang'),{beheerders:['bo','ed'],aangemaaktDoor:'bo',versie:1});
      batch.set(r(d,'inhoud'),{titel:'Teamversie'});
      batch.set(r(d,'beheer'),{tekst:'Alleen Bo en Ed',notities:''});
      batch.set(doc(d,`${pad}/teamomgevingBestanden/voorbeeld/delen/000`),{data:'JVBERi0='});
      await assertSucceeds(batch.commit());
    });
    await t.test('teamleden lezen inhoud en pdf maar geen beheer', async () => {
      await assertSucceeds(getDoc(r(db('lid'),'inhoud')));
      await assertSucceeds(getDoc(doc(db('lid'),`${pad}/teamomgevingBestanden/voorbeeld/delen/000`)));
      await assertFails(getDoc(r(db('lid'),'beheer')));
      await assertFails(getDoc(r(db('andere-beheerder'),'beheer')));
    });
    await t.test('beide aangewezen accounts mogen bespreeknotities lezen', async () => {
      for (const uid of ['bo','ed']) await assertSucceeds(getDoc(r(db(uid),'beheer')));
      await assertSucceeds(updateDoc(r(db('ed'),'beheer'),{notities:'Bespreken',bijgewerktOp:serverTimestamp()}));
      await assertFails(updateDoc(r(db('lid'),'beheer'),{notities:'Onbevoegd',bijgewerktOp:serverTimestamp()}));
    });
    await t.test('andere teams en gasten lezen niets', async () => {
      for (const uid of ['buitenstaander',null]) {
        for (const id of ['inhoud','beheer','toegang']) await assertFails(getDoc(r(db(uid),id)));
        await assertFails(getDoc(doc(db(uid),`${pad}/teamomgevingBestanden/voorbeeld/delen/000`)));
      }
    });
    await t.test('beheerder kan zichzelf niet toevoegen of omgeving overschrijven', async () => {
      await assertFails(updateDoc(r(db('andere-beheerder'),'toegang'),{beheerders:['andere-beheerder','ed']}));
      await assertFails(deleteDoc(r(db('bo'),'toegang')));
      await assertFails(setDoc(r(db('bo'),'inhoud'),{titel:'Overschreven'}));
      await assertFails(updateDoc(r(db('ed'),'beheer'),{tekst:'Bron vervangen'}));
    });
    await t.test('te groot pdfdeel wordt geweigerd', async () => {
      await assertFails(setDoc(doc(db('bo'),`${pad}/teamomgevingBestanden/voorbeeld/delen/001`),{data:'x'.repeat(600001)}));
    });
    await t.test('vertrokken begeleider verliest ook toegang tot beheer', async () => {
      await env.withSecurityRulesDisabled((ctx)=>deleteDoc(doc(ctx.firestore(),`${pad}/leden/ed`)));
      await assertFails(getDoc(r(db('ed'),'beheer')));
    });
  } finally { await env.cleanup(); }
});
