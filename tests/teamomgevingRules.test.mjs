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
    await t.test('begeleiders mogen de teksten bijwerken', async () => {
      await assertSucceeds(updateDoc(r(db('ed'),'inhoud'),{titel:'Teamversie',onderdelen:[{id:'overzicht',titel:'Overzicht',tekst:'Bijgewerkt'}],bijgewerktOp:serverTimestamp(),bijgewerktDoor:'ed'}));
    });
    await t.test('een ander teamlid of teambeheerder mag dat niet', async () => {
      for (const uid of ['lid','andere-beheerder','buitenstaander']) {
        await assertFails(updateDoc(r(db(uid),'inhoud'),{titel:'Gekaapt',onderdelen:[{id:'x',titel:'X',tekst:'y'}],bijgewerktOp:serverTimestamp(),bijgewerktDoor:uid}));
      }
    });
    await t.test('bijwerken kan de documenten en de sporen niet meenemen', async () => {
      const basis = {titel:'Teamversie',onderdelen:[{id:'overzicht',titel:'Overzicht',tekst:'x'}],bijgewerktOp:serverTimestamp(),bijgewerktDoor:'bo'};
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{...basis,documenten:[{id:'voorbeeld',sha256:'a'.repeat(64)}]}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{...basis,bijgewerktDoor:'ed'}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{...basis,bijgewerktOp:new Date(0)}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{...basis,titel:''}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{...basis,onderdelen:[]}));
    });
    await t.test('een document mag erbij, maar alleen achteraan en zonder de rest aan te raken', async () => {
      const oud={id:'voorbeeld',titel:'Terugkoppeling',naam:'a.pdf',sha256:'a'.repeat(64),delen:1};
      const nieuw={id:'handleiding',titel:'Hand-in-Handleiding',naam:'hh.pdf',sha256:'b'.repeat(64),delen:2};
      await env.withSecurityRulesDisabled((ctx)=>updateDoc(doc(ctx.firestore(),`${pad}/teamomgeving/inhoud`),{documenten:[oud]}));
      const voegToe=(uid,lijst)=>updateDoc(r(db(uid),'inhoud'),{documenten:lijst,bijgewerktOp:serverTimestamp(),bijgewerktDoor:uid});
      // Alleen de twee aangewezen begeleiders.
      for (const uid of ['lid','andere-beheerder','buitenstaander']) await assertFails(voegToe(uid,[oud,nieuw]));
      // Niet vooraan, niet in plaats van, niet twee tegelijk, en krimpen mag niet.
      await assertFails(voegToe('bo',[nieuw,oud]));
      await assertFails(voegToe('bo',[nieuw]));
      await assertFails(voegToe('bo',[oud,nieuw,{...nieuw,id:'derde'}]));
      await assertFails(voegToe('bo',[]));
      // Een bestaand document mag niet meeveranderen -- daar hangt de controle
      // bij het downloaden aan.
      await assertFails(voegToe('bo',[{...oud,sha256:'c'.repeat(64)},nieuw]));
      await assertFails(voegToe('bo',[{...oud,titel:'Anders'},nieuw]));
      await assertFails(voegToe('bo',[{...oud,naam:'anders.pdf'},nieuw]));
      // En de nieuwe regel moet zelf kloppen.
      await assertFails(voegToe('bo',[oud,{...nieuw,sha256:'geen hash'}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,naam:'hh.exe'}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,naam:'../buiten.pdf'}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,id:'Met Hoofdletters'}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,delen:0}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,delen:11}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,titel:''}]));
      await assertFails(voegToe('bo',[oud,{...nieuw,extra:'veld'}]));
      await assertFails(voegToe('bo',[oud,{titel:'Zonder id',naam:'x.pdf',sha256:'b'.repeat(64),delen:1}]));
      // Zo mag het wel.
      await assertSucceeds(voegToe('ed',[oud,nieuw]));
    });
    await t.test('toevoegen kan de teksten of de sporen niet meenemen', async () => {
      const lijst=[{id:'voorbeeld',titel:'Terugkoppeling',naam:'a.pdf',sha256:'a'.repeat(64),delen:1},{id:'handleiding',titel:'Hand-in-Handleiding',naam:'hh.pdf',sha256:'b'.repeat(64),delen:2},{id:'derde',titel:'Derde',naam:'c.pdf',sha256:'d'.repeat(64),delen:1}];
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{documenten:lijst,titel:'Gekaapt',bijgewerktOp:serverTimestamp(),bijgewerktDoor:'bo'}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{documenten:lijst,bijgewerktOp:new Date(0),bijgewerktDoor:'bo'}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{documenten:lijst,bijgewerktOp:serverTimestamp(),bijgewerktDoor:'ed'}));
    });
    await t.test('een document mag eruit, maar alleen een en zonder de rest aan te raken', async () => {
      const oud={id:'voorbeeld',titel:'Terugkoppeling',naam:'a.pdf',sha256:'a'.repeat(64),delen:1};
      const nieuw={id:'handleiding',titel:'Hand-in-Handleiding',naam:'hh.pdf',sha256:'b'.repeat(64),delen:2};
      const haalWeg=(uid,lijst)=>updateDoc(r(db(uid),'inhoud'),{documenten:lijst,bijgewerktOp:serverTimestamp(),bijgewerktDoor:uid});
      // Alleen de twee aangewezen begeleiders.
      for (const uid of ['lid','andere-beheerder','buitenstaander']) await assertFails(haalWeg(uid,[oud]));
      // Niet twee tegelijk, en niet weghalen terwijl je er een verandert.
      await assertFails(haalWeg('bo',[]));
      await assertFails(haalWeg('bo',[{...oud,titel:'Anders'}]));
      await assertFails(haalWeg('bo',[{...nieuw,sha256:'e'.repeat(64)}]));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{documenten:[oud],titel:'Gekaapt',bijgewerktOp:serverTimestamp(),bijgewerktDoor:'bo'}));
      await assertFails(updateDoc(r(db('bo'),'inhoud'),{documenten:[oud],bijgewerktOp:serverTimestamp(),bijgewerktDoor:'ed'}));
      // Zo mag het wel: er blijft er precies een over, ongewijzigd.
      await assertSucceeds(haalWeg('bo',[oud]));
      // En de delen opruimen mag daarna, maar niet door een gewoon teamlid.
      await assertFails(deleteDoc(doc(db('lid'),`${pad}/teamomgevingBestanden/handleiding/delen/000`)));
      await assertSucceeds(deleteDoc(doc(db('ed'),`${pad}/teamomgevingBestanden/handleiding/delen/000`)));
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
