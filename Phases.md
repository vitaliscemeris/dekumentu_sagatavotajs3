# Tālākās izstrādes fāzes

Šis ir darba saraksts pēc pirmās versijas: iesniegums, pilnvara, rēķins, izziņa, A4 priekšskatījums, Word lejupielāde, drukāšana un melnraksts šajā pārlūkā.

Kad uzdevums ir izpildīts, nomaini `- [ ]` uz `- [x]`. Vienā piegājienā pabeidz vienu fāzi vai tās nepabeigtos uzdevumus, un atķeksē tikai to, kas tiešām ir kodā un pārbaudīts.

## Fāze 1. Telefons un skārienekrāns

Šaurā ekrānā forma, veidņu izvēle un priekšskatījums ir lietojami ar īkšķi. Ievades lauki skārienierīcēs paliek vismaz 16 px, lai pārlūks, fokusējot lauku, nepalielinātu lapu.

- [x] Galvene šaurā ekrānā sakrājas kolonnā: nosaukums augšā, darbības pogas zem tā un sniedzas visā platumā.
- [x] Veidņu saraksts telefonā ir ritināms, un aktīvā veidne ir redzama bez horizontālas meklēšanas.
- [x] Formas režģis un rēķina pozīcijas telefonā ir vienā kolonnā, ar pietiekami lielām pogām pievienošanai un dzēšanai.
- [x] Starp formu un priekšskatījumu telefonā var pārslēgties, lai A4 lapa neaizsedz ievadi.
- [x] Priekšskatījuma lapa telefonā ievietojas ekrāna platumā un paliek lasāma.
- [x] `input`, `textarea` un `select` skārienekrāna ierīcēs (`pointer: coarse`) ir `font-size` vismaz 16 px, arī ja darbvirsmas fonts vēlāk kļūst mazāks.
- [x] Skārienmērķi (pogas, veidņu kartītes, dzēšanas poga) ir vismaz 44 px augsti.
- [x] Telefona izkārtojums ir pārbaudīts šaurā skatā ap 390 px platumā: veidnes maiņa, lauka aizpilde bez lapas pietuvinājuma, Word poga un drukāšana.

## Fāze 2. Formas un melnraksti

Ātrāk aizpildīt atkārtotus datus un saprast, kas vēl trūkst, pirms dokuments tiek saglabāts.

- [ ] Obligātais lauks, kas ir tukšs, parāda savu paziņojumu pie lauka, ne tikai kopējo skaitu apakšā.
- [ ] Datuma lauki saglabā un rāda latviešu datuma formu, un dokumentā datums paliek locījumā, kā veidnē.
- [ ] Bieži lietotie personas un uzņēmuma dati (vārds, personas kods, adrese, konts) ir kopīgs profils, ko var ievilkt jebkurā veidnē.
- [ ] Notīrīšanu var atsaukt vienu soli atpakaļ uz iepriekšējo melnrakstu.
- [ ] Melnrakstu var eksportēt un importēt kā JSON failu, lai pārceltu uz citu pārlūku.
- [ ] Saglabāšanas kļūda (pilna vai slēgta krātuve) ir redzama lietotājam, nevis pazūd klusējot.

## Fāze 3. Veidnes

Jauni ikdienas dokumenti uz tā paša lauku un bloku modeļa, bez atsevišķa ekrāna katrai veidnei.

- [ ] Darba līguma veidne: puses, amats, alga, termiņš un pienākumu apraksts.
- [ ] Nodošanas-pieņemšanas akta veidne: objekts, datums, stāvoklis un abu pušu paraksti.
- [ ] Pavadzīmes veidne: nosūtītājs, saņēmējs, pozīcijas un daudzumi bez PVN kopsavilkuma, ja tas nav vajadzīgs.
- [ ] Katrai jaunajai veidnei ir tukšs melnraksts, paraugs un Word eksports, kas sakrīt ar priekšskatījumu.
- [ ] Veidņu sarakstā jaunās veidnes ir atrodamas pēc nosaukuma, kad to ir vairāk nekā četras.

## Fāze 4. Dokuments, lappuses un eksports

Garš teksts nepaliek vienā bezgalīgā lapā, un saglabātais fails ir nosaucams bez papildu soļiem.

- [ ] Priekšskatījums sadala garu dokumentu A4 lappusēs un parāda lappušu skaitu.
- [ ] Drukāšana un PDF ievēro tos pašus lappušu pārtraukumus, ko rāda priekšskatījums.
- [ ] Word fails sadala saturu pa lappusēm tāpat kā priekšskatījums, ieskaitot tabulas un paraksta bloku.
- [ ] Lejupielādes nosaukums ņem dokumenta veidu un personas vai uzņēmuma vārdu, piemēram `iesniegums-anna-berzina.docx`.
- [ ] Eksporta kļūda paliek pie pogas un ļauj mēģināt vēlreiz, nezaudējot ievadītos datus.

## Fāze 5. Kvalitāte

Izmaiņas veidnēs un eksportā var pārbaudīt bez rokas pārlasīšanas katru reizi.

- [ ] Modeļa testi: summas, PVN, tukšu lauku aizvietotāji un nosacījuma lauki (`showWhen`).
- [ ] Krātuves testi: bojāts JSON, sveši lauki un trūkstošas pozīcijas nesalauž melnrakstu.
- [ ] Veidņu tests katrai veidnei: paraugs iziet cauri `render` bez tukšiem blokiem un Word ģenerēšana pabeidzas.
- [ ] Formas laukiem ir saistītas etiķetes, un kļūdas paziņojums ir `aria-invalid` / `aria-describedby`.
- [ ] Tastatūra var aiziet cauri veidnēm, laukiem un galvenajām pogām bez peles.
- [ ] `npm run lint` un `npm run build` ir tīri pēc šīs fāzes izmaiņām.
