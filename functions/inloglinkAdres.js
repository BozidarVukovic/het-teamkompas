// Waar de inloglink naartoe wijst.
//
// Apart bestand, omdat dit het stukje is dat stil kan breken. De teamcode reist
// mee in de adresbalk; raakt hij onderweg kwijt, dan komt iemand ingelogd
// binnen op de vraag "bij welk team hoor je?" met een code die hij nergens
// heeft staan. Dat is een doodlopende weg zonder foutmelding, en dus precies
// het soort ding dat een test verdient.
//
// Waarom niet de link van Firebase zelf: die wijst naar firebaseapp.com, een
// gedeeld domein waar veel phishing vandaan komt, terwijl de afzender van ons
// is. Dat is het patroon waar spamfilters op letten, en voor de ontvanger ziet
// het er ook niet uit als iets van ons. De ontvangende kant heeft dat domein
// niet nodig: signInWithEmailLink() leest alleen mode en oobCode uit de
// adresbalk. Dus houden we de hele queryreeks en zetten er ons eigen adres
// voor.
//
// En daar komt de code bij. Hij stond alleen in de opslag van de browser
// waarin iemand de uitnodiging opende. Wie de uitnodiging op zijn laptop
// aanklikt en de inlogmail op zijn telefoon opent -- wat de helft van de mensen
// doet -- had die opslag niet. Nu zit de code in de link zelf.

function inlogAdres(firebaseLink, terug, code) {
  const bron = new URL(firebaseLink);
  const doel = new URL(terug);
  doel.search = bron.search;
  if (code) doel.searchParams.set("code", code);
  return doel.toString();
}

module.exports = { inlogAdres };
