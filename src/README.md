# Mijn Teamkompas refactor

Deze map bevat een eerste veilige opsplitsing van de websitecode.

## Aangepast

- `App.jsx`: hoofdbestand blijft leidend, maar gebruikt nu centrale Firebase-config en gedeelde contactmodal.
- `OnzeAanpak.jsx`: gebruikt dezelfde gedeelde contactmodal en bevat geen dubbele Firebase- of EmailJS-config meer.
- `components/ContactModal.jsx`: één centrale modal voor alle contactknoppen.
- `config/firebase.js`: één plek voor Firebase, Auth, Firestore en admin e-mailadressen.
- `config/email.js`: één plek voor EmailJS-instellingen.

## Belangrijk

Plaats de mapjes `components` en `config` op hetzelfde niveau als `App.jsx` en `OnzeAanpak.jsx`.

Controleer na plaatsen minimaal:

1. Homepagina opent.
2. `/onze-aanpak` opent.
3. Knop `Plan een verkennend gesprek` opent modal.
4. Test-contactaanvraag komt binnen in Firestore.
5. Scanlink met `?scan=` blijft werken.
6. Admin-login blijft werken.

## Volgende logische stap

Daarna kun je ook de homepage verder opsplitsen in losse secties, bijvoorbeeld:

- `sections/HeroSection.jsx`
- `sections/TeamscanSection.jsx`
- `sections/ThemeDeepDiveSection.jsx`
- `sections/DiverseWorkplacesSection.jsx`

Dat heb ik nu bewust nog niet volledig gedaan, omdat dit meer risico geeft op breuk in de bestaande scan- en adminfunctionaliteit.
