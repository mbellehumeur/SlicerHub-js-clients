import type { AppLocale } from './storage';
import { resolveStoredLocale } from './storage';

/** Reporting app chrome (section titles, column headers, labels). */
export type ReportingChrome = {
  viewers: string;
  worklistLabel: string;
  slicerWorklist: string;
  snapshots: string;
  volumes: string;
  segmentations: string;
  measurements: string;
  currentContext: string;
  none: string;
  close: string;
  closeContext: string;
  colNum: string;
  colThumb: string;
  colFilename: string;
  colTime: string;
  colName: string;
  colCrop: string;
  colBox: string;
  colShift: string;
  colPreset: string;
  colLabel: string;
  colSnomed: string;
  colVoxels: string;
  colSegment: string;
  colQuantity: string;
  colValue: string;
  colUnits: string;
  noReportSelected: string;
  noSnapshots: string;
  noSegmentations: string;
  noMeasurements: string;
  refreshFromImageDisplay: string;
  notConnectedToHub: string;
  worklistNoOpenStudy: string;
};

const en: ReportingChrome = {
  viewers: 'Viewers:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Snapshots',
  volumes: 'Volumes',
  segmentations: 'Segmentations',
  measurements: 'Measurements',
  currentContext: 'Current context:',
  none: 'none',
  close: 'Close',
  closeContext: 'Close current context',
  colNum: '#',
  colThumb: 'Thumb',
  colFilename: 'Filename',
  colTime: 'Time',
  colName: 'Name',
  colCrop: 'Crop',
  colBox: 'Box',
  colShift: 'Shift',
  colPreset: 'Preset',
  colLabel: 'Label',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxels',
  colSegment: 'Segment',
  colQuantity: 'Quantity',
  colValue: 'Value',
  colUnits: 'Units',
  noReportSelected: 'No report selected',
  noSnapshots: 'No snapshots',
  noSegmentations:
    'No segmentations from Image Display yet. Refresh to load the SEG catalog.',
  noMeasurements:
    'No measurements yet. Use + on a segmentation to add one, or receive a TID1500 SR.',
  refreshFromImageDisplay: 'Refresh from Image Display',
  notConnectedToHub: 'Not connected to Slicer hub',
  worklistNoOpenStudy: 'Worklist responded with no open study',
};

const de: ReportingChrome = {
  viewers: 'Viewer:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Snapshots',
  volumes: 'Volumina',
  segmentations: 'Segmentierungen',
  measurements: 'Messungen',
  currentContext: 'Aktueller Kontext:',
  none: 'keiner',
  close: 'Schließen',
  closeContext: 'Aktuellen Kontext schließen',
  colNum: '#',
  colThumb: 'Vorschaubild',
  colFilename: 'Dateiname',
  colTime: 'Zeit',
  colName: 'Name',
  colCrop: 'Zuschneiden',
  colBox: 'Box',
  colShift: 'Verschiebung',
  colPreset: 'Voreinstellung',
  colLabel: 'Bezeichnung',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxel',
  colSegment: 'Segment',
  colQuantity: 'Größe',
  colValue: 'Wert',
  colUnits: 'Einheiten',
  noReportSelected: 'Kein Bericht ausgewählt',
  noSnapshots: 'Keine Snapshots',
  noSegmentations:
    'Noch keine Segmentierungen vom Image Display. Aktualisieren, um den SEG-Katalog zu laden.',
  noMeasurements:
    'Noch keine Messungen. Mit + an einer Segmentierung eine hinzufügen oder einen TID1500-SR empfangen.',
  refreshFromImageDisplay: 'Vom Image Display aktualisieren',
  notConnectedToHub: 'Nicht mit dem Hub-Hub verbunden',
  worklistNoOpenStudy: 'Die Worklist meldete keine offene Studie',
};

const fr: ReportingChrome = {
  viewers: 'Visionneuses :',
  worklistLabel: 'Liste de travail :',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Instantanés',
  volumes: 'Volumes',
  segmentations: 'Segmentations',
  measurements: 'Mesures',
  currentContext: 'Contexte actuel :',
  none: 'aucun',
  close: 'Fermer',
  closeContext: 'Fermer le contexte actuel',
  colNum: '#',
  colThumb: 'Vignette',
  colFilename: 'Fichier',
  colTime: 'Heure',
  colName: 'Nom',
  colCrop: 'Recadrage',
  colBox: 'Boîte',
  colShift: 'Décalage',
  colPreset: 'Préréglage',
  colLabel: 'Libellé',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxels',
  colSegment: 'Segment',
  colQuantity: 'Quantité',
  colValue: 'Valeur',
  colUnits: 'Unités',
  noReportSelected: 'Aucun rapport sélectionné',
  noSnapshots: 'Aucun instantané',
  noSegmentations:
    'Aucune segmentation depuis Image Display pour le moment. Actualisez pour charger le catalogue SEG.',
  noMeasurements:
    'Aucune mesure pour le moment. Utilisez + sur une segmentation pour en ajouter une, ou recevez un SR TID1500.',
  refreshFromImageDisplay: 'Actualiser depuis Image Display',
  notConnectedToHub: 'Non connecté au hub Hub',
  worklistNoOpenStudy: 'La liste de travail a répondu sans étude ouverte',
};

const es: ReportingChrome = {
  viewers: 'Visores:',
  worklistLabel: 'Lista de trabajo:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Capturas',
  volumes: 'Volúmenes',
  segmentations: 'Segmentaciones',
  measurements: 'Mediciones',
  currentContext: 'Contexto actual:',
  none: 'ninguno',
  close: 'Cerrar',
  closeContext: 'Cerrar el contexto actual',
  colNum: '#',
  colThumb: 'Miniatura',
  colFilename: 'Archivo',
  colTime: 'Hora',
  colName: 'Nombre',
  colCrop: 'Recorte',
  colBox: 'Caja',
  colShift: 'Desplazamiento',
  colPreset: 'Preajuste',
  colLabel: 'Etiqueta',
  colSnomed: 'SNOMED',
  colVoxels: 'Vóxeles',
  colSegment: 'Segmento',
  colQuantity: 'Cantidad',
  colValue: 'Valor',
  colUnits: 'Unidades',
  noReportSelected: 'Ningún informe seleccionado',
  noSnapshots: 'No hay capturas',
  noSegmentations:
    'Aún no hay segmentaciones desde Image Display. Actualiza para cargar el catálogo SEG.',
  noMeasurements:
    'Aún no hay mediciones. Usa + en una segmentación para añadir una, o recibe un SR TID1500.',
  refreshFromImageDisplay: 'Actualizar desde Image Display',
  notConnectedToHub: 'Sin conexión al hub Hub',
  worklistNoOpenStudy:
    'La lista de trabajo respondió que no hay ningún estudio abierto',
};

const ca: ReportingChrome = {
  viewers: 'Visualitzadors:',
  worklistLabel: 'Llista de treball:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Captures',
  volumes: 'Volums',
  segmentations: 'Segmentacions',
  measurements: 'Mesures',
  currentContext: 'Context actual:',
  none: 'cap',
  close: 'Tancar',
  closeContext: 'Tancar el context actual',
  colNum: '#',
  colThumb: 'Miniatura',
  colFilename: 'Fitxer',
  colTime: 'Hora',
  colName: 'Nom',
  colCrop: 'Retall',
  colBox: 'Caixa',
  colShift: 'Desplaçament',
  colPreset: 'Predefinit',
  colLabel: 'Etiqueta',
  colSnomed: 'SNOMED',
  colVoxels: 'Vòxels',
  colSegment: 'Segment',
  colQuantity: 'Quantitat',
  colValue: 'Valor',
  colUnits: 'Unitats',
  noReportSelected: 'Cap informe seleccionat',
  noSnapshots: 'No hi ha captures',
  noSegmentations:
    'Encara no hi ha segmentacions des d’Image Display. Actualitzeu per carregar el catàleg SEG.',
  noMeasurements:
    'Encara no hi ha mesures. Useu + en una segmentació per afegir-ne una, o rebeu un SR TID1500.',
  refreshFromImageDisplay: 'Actualitzar des d’Image Display',
  notConnectedToHub: 'No connectat al hub Hub',
  worklistNoOpenStudy: 'La llista de treball ha respost sense estudi obert',
};

const it: ReportingChrome = {
  viewers: 'Viewer:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Istantanee',
  volumes: 'Volumi',
  segmentations: 'Segmentazioni',
  measurements: 'Misurazioni',
  currentContext: 'Contesto attuale:',
  none: 'nessuno',
  close: 'Chiudi',
  closeContext: 'Chiudi il contesto attuale',
  colNum: '#',
  colThumb: 'Anteprima',
  colFilename: 'Nome file',
  colTime: 'Ora',
  colName: 'Nome',
  colCrop: 'Ritaglio',
  colBox: 'Box',
  colShift: 'Spostamento',
  colPreset: 'Predefinito',
  colLabel: 'Etichetta',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxel',
  colSegment: 'Segmento',
  colQuantity: 'Quantità',
  colValue: 'Valore',
  colUnits: 'Unità',
  noReportSelected: 'Nessun referto selezionato',
  noSnapshots: 'Nessuna istantanea',
  noSegmentations:
    'Ancora nessuna segmentazione da Image Display. Aggiorna per caricare il catalogo SEG.',
  noMeasurements:
    'Ancora nessuna misurazione. Usa + su una segmentazione per aggiungerne una, oppure ricevi un SR TID1500.',
  refreshFromImageDisplay: 'Aggiorna da Image Display',
  notConnectedToHub: 'Non connesso all’hub Hub',
  worklistNoOpenStudy: 'La worklist ha risposto senza nessuno studio aperto',
};

const pt: ReportingChrome = {
  viewers: 'Visualizadores:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Instantâneos',
  volumes: 'Volumes',
  segmentations: 'Segmentações',
  measurements: 'Medições',
  currentContext: 'Contexto atual:',
  none: 'nenhum',
  close: 'Fechar',
  closeContext: 'Fechar o contexto atual',
  colNum: '#',
  colThumb: 'Miniatura',
  colFilename: 'Ficheiro',
  colTime: 'Hora',
  colName: 'Nome',
  colCrop: 'Recorte',
  colBox: 'Caixa',
  colShift: 'Deslocamento',
  colPreset: 'Predefinição',
  colLabel: 'Etiqueta',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxels',
  colSegment: 'Segmento',
  colQuantity: 'Quantidade',
  colValue: 'Valor',
  colUnits: 'Unidades',
  noReportSelected: 'Nenhum relatório selecionado',
  noSnapshots: 'Sem instantâneos',
  noSegmentations:
    'Ainda não há segmentações do Image Display. Atualize para carregar o catálogo SEG.',
  noMeasurements:
    'Ainda não há medições. Use + numa segmentação para adicionar uma, ou receba um SR TID1500.',
  refreshFromImageDisplay: 'Atualizar a partir do Image Display',
  notConnectedToHub: 'Sem ligação ao hub Hub',
  worklistNoOpenStudy: 'A worklist respondeu sem nenhum estudo aberto',
};

const ko: ReportingChrome = {
  viewers: '뷰어:',
  worklistLabel: '워크리스트:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: '스냅샷',
  volumes: '볼륨',
  segmentations: '세그멘테이션',
  measurements: '측정',
  currentContext: '현재 컨텍스트:',
  none: '없음',
  close: '닫기',
  closeContext: '현재 컨텍스트 닫기',
  colNum: '#',
  colThumb: '미리보기',
  colFilename: '파일 이름',
  colTime: '시간',
  colName: '이름',
  colCrop: '자르기',
  colBox: '박스',
  colShift: '시프트',
  colPreset: '프리셋',
  colLabel: '레이블',
  colSnomed: 'SNOMED',
  colVoxels: '복셀',
  colSegment: '세그먼트',
  colQuantity: '수량',
  colValue: '값',
  colUnits: '단위',
  noReportSelected: '선택한 보고서 없음',
  noSnapshots: '스냅샷 없음',
  noSegmentations:
    '아직 Image Display에서 가져온 세그멘테이션이 없습니다. 새로고침하여 SEG 카탈로그를 불러오세요.',
  noMeasurements:
    '아직 측정이 없습니다. 세그멘테이션의 +로 추가하거나 TID1500 SR을 받으세요.',
  refreshFromImageDisplay: 'Image Display에서 새로고침',
  notConnectedToHub: 'Hub 허브에 연결되지 않음',
  worklistNoOpenStudy: '워크리스트가 열린 검사 없이 응답했습니다',
};

const pl: ReportingChrome = {
  viewers: 'Przeglądarki:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Migawki',
  volumes: 'Wolumeny',
  segmentations: 'Segmentacje',
  measurements: 'Pomiary',
  currentContext: 'Bieżący kontekst:',
  none: 'brak',
  close: 'Zamknij',
  closeContext: 'Zamknij bieżący kontekst',
  colNum: '#',
  colThumb: 'Miniatura',
  colFilename: 'Nazwa pliku',
  colTime: 'Czas',
  colName: 'Nazwa',
  colCrop: 'Przycięcie',
  colBox: 'Box',
  colShift: 'Przesunięcie',
  colPreset: 'Preset',
  colLabel: 'Etykieta',
  colSnomed: 'SNOMED',
  colVoxels: 'Woksele',
  colSegment: 'Segment',
  colQuantity: 'Wielkość',
  colValue: 'Wartość',
  colUnits: 'Jednostki',
  noReportSelected: 'Nie wybrano raportu',
  noSnapshots: 'Brak migawek',
  noSegmentations:
    'Brak jeszcze segmentacji z Image Display. Odśwież, aby wczytać katalog SEG.',
  noMeasurements:
    'Brak jeszcze pomiarów. Użyj + przy segmentacji, aby dodać, albo odbierz SR TID1500.',
  refreshFromImageDisplay: 'Odśwież z Image Display',
  notConnectedToHub: 'Brak połączenia z hubem Hub',
  worklistNoOpenStudy: 'Worklist odpowiedziała bez otwartego badania',
};

const uk: ReportingChrome = {
  viewers: 'Переглядачі:',
  worklistLabel: 'Робочий список:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Знімки',
  volumes: 'Об’єми',
  segmentations: 'Сегментації',
  measurements: 'Вимірювання',
  currentContext: 'Поточний контекст:',
  none: 'немає',
  close: 'Закрити',
  closeContext: 'Закрити поточний контекст',
  colNum: '#',
  colThumb: 'Мініатюра',
  colFilename: 'Ім’я файлу',
  colTime: 'Час',
  colName: 'Назва',
  colCrop: 'Обрізання',
  colBox: 'Box',
  colShift: 'Зсув',
  colPreset: 'Предустановка',
  colLabel: 'Мітка',
  colSnomed: 'SNOMED',
  colVoxels: 'Вокселі',
  colSegment: 'Сегмент',
  colQuantity: 'Величина',
  colValue: 'Значення',
  colUnits: 'Одиниці',
  noReportSelected: 'Звіт не вибрано',
  noSnapshots: 'Немає знімків',
  noSegmentations:
    'Ще немає сегментацій з Image Display. Оновіть, щоб завантажити каталог SEG.',
  noMeasurements:
    'Ще немає вимірювань. Використайте + на сегментації, щоб додати, або отримайте SR TID1500.',
  refreshFromImageDisplay: 'Оновити з Image Display',
  notConnectedToHub: 'Немає з’єднання з Hub-хабом',
  worklistNoOpenStudy: 'Робочий список відповів без відкритого дослідження',
};

const cs: ReportingChrome = {
  viewers: 'Prohlížeče:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Snímky',
  volumes: 'Volumeny',
  segmentations: 'Segmentace',
  measurements: 'Měření',
  currentContext: 'Aktuální kontext:',
  none: 'žádný',
  close: 'Zavřít',
  closeContext: 'Zavřít aktuální kontext',
  colNum: '#',
  colThumb: 'Náhled',
  colFilename: 'Název souboru',
  colTime: 'Čas',
  colName: 'Název',
  colCrop: 'Ořez',
  colBox: 'Box',
  colShift: 'Posun',
  colPreset: 'Předvolba',
  colLabel: 'Štítek',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxely',
  colSegment: 'Segment',
  colQuantity: 'Veličina',
  colValue: 'Hodnota',
  colUnits: 'Jednotky',
  noReportSelected: 'Není vybrána žádná zpráva',
  noSnapshots: 'Žádné snímky',
  noSegmentations:
    'Zatím žádné segmentace z Image Display. Obnovte pro načtení katalogu SEG.',
  noMeasurements:
    'Zatím žádná měření. Použijte + u segmentace pro přidání, nebo přijměte SR TID1500.',
  refreshFromImageDisplay: 'Obnovit z Image Display',
  notConnectedToHub: 'Nepřipojeno k Hub hubu',
  worklistNoOpenStudy: 'Worklist odpověděla bez otevřené studie',
};

const nl: ReportingChrome = {
  viewers: 'Viewers:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Snapshots',
  volumes: 'Volumes',
  segmentations: 'Segmentaties',
  measurements: 'Metingen',
  currentContext: 'Huidige context:',
  none: 'geen',
  close: 'Sluiten',
  closeContext: 'Huidige context sluiten',
  colNum: '#',
  colThumb: 'Miniatuur',
  colFilename: 'Bestandsnaam',
  colTime: 'Tijd',
  colName: 'Naam',
  colCrop: 'Bijsnijden',
  colBox: 'Box',
  colShift: 'Verschuiving',
  colPreset: 'Voorinstelling',
  colLabel: 'Label',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxels',
  colSegment: 'Segment',
  colQuantity: 'Grootheid',
  colValue: 'Waarde',
  colUnits: 'Eenheden',
  noReportSelected: 'Geen rapport geselecteerd',
  noSnapshots: 'Geen snapshots',
  noSegmentations:
    'Nog geen segmentaties van Image Display. Vernieuw om de SEG-catalogus te laden.',
  noMeasurements:
    'Nog geen metingen. Gebruik + op een segmentatie om er een toe te voegen, of ontvang een TID1500-SR.',
  refreshFromImageDisplay: 'Vernieuwen vanaf Image Display',
  notConnectedToHub: 'Niet verbonden met de Hub-hub',
  worklistNoOpenStudy: 'Worklist antwoordde zonder open studie',
};

const el: ReportingChrome = {
  viewers: 'Προβολείς:',
  worklistLabel: 'Λίστα εργασίας:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Στιγμιότυπα',
  volumes: 'Όγκοι',
  segmentations: 'Τμηματοποιήσεις',
  measurements: 'Μετρήσεις',
  currentContext: 'Τρέχον πλαίσιο:',
  none: 'κανένα',
  close: 'Κλείσιμο',
  closeContext: 'Κλείσιμο τρέχοντος πλαισίου',
  colNum: '#',
  colThumb: 'Μικρογραφία',
  colFilename: 'Όνομα αρχείου',
  colTime: 'Ώρα',
  colName: 'Όνομα',
  colCrop: 'Περικοπή',
  colBox: 'Box',
  colShift: 'Μετατόπιση',
  colPreset: 'Προεπιλογή',
  colLabel: 'Ετικέτα',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxel',
  colSegment: 'Τμήμα',
  colQuantity: 'Ποσότητα',
  colValue: 'Τιμή',
  colUnits: 'Μονάδες',
  noReportSelected: 'Δεν επιλέχθηκε αναφορά',
  noSnapshots: 'Χωρίς στιγμιότυπα',
  noSegmentations:
    'Δεν υπάρχουν ακόμη τμηματοποιήσεις από το Image Display. Ανανεώστε για φόρτωση του καταλόγου SEG.',
  noMeasurements:
    'Δεν υπάρχουν ακόμη μετρήσεις. Χρησιμοποιήστε το + σε μια τμηματοποίηση για προσθήκη, ή λάβετε SR TID1500.',
  refreshFromImageDisplay: 'Ανανέωση από Image Display',
  notConnectedToHub: 'Χωρίς σύνδεση στο Slicer hub',
  worklistNoOpenStudy: 'Η λίστα εργασίας απάντησε χωρίς ανοιχτή μελέτη',
};

const lv: ReportingChrome = {
  viewers: 'Skatītāji:',
  worklistLabel: 'Darba saraksts:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Momentuzņēmumi',
  volumes: 'Tilpumi',
  segmentations: 'Segmentācijas',
  measurements: 'Mērījumi',
  currentContext: 'Pašreizējais konteksts:',
  none: 'nav',
  close: 'Aizvērt',
  closeContext: 'Aizvērt pašreizējo kontekstu',
  colNum: '#',
  colThumb: 'Sīktēls',
  colFilename: 'Faila nosaukums',
  colTime: 'Laiks',
  colName: 'Nosaukums',
  colCrop: 'Apgriešana',
  colBox: 'Box',
  colShift: 'Nobīde',
  colPreset: 'Priekšiestatījums',
  colLabel: 'Etiķete',
  colSnomed: 'SNOMED',
  colVoxels: 'Vokseļi',
  colSegment: 'Segments',
  colQuantity: 'Lielums',
  colValue: 'Vērtība',
  colUnits: 'Vienības',
  noReportSelected: 'Nav atlasīts ziņojums',
  noSnapshots: 'Nav momentuzņēmumu',
  noSegmentations:
    'Vēl nav segmentāciju no Image Display. Atsvaidziniet, lai ielādētu SEG katalogu.',
  noMeasurements:
    'Vēl nav mērījumu. Izmantojiet + pie segmentācijas, lai pievienotu, vai saņemiet TID1500 SR.',
  refreshFromImageDisplay: 'Atsvaidzināt no Image Display',
  notConnectedToHub: 'Nav savienojuma ar Slicer hub',
  worklistNoOpenStudy: 'Darba saraksts atbildēja bez atvērta pētījuma',
};

const hu: ReportingChrome = {
  viewers: 'Megjelenítők:',
  worklistLabel: 'Munkalista:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Pillanatképek',
  volumes: 'Térfogatok',
  segmentations: 'Szegmentációk',
  measurements: 'Mérések',
  currentContext: 'Aktuális kontextus:',
  none: 'nincs',
  close: 'Bezárás',
  closeContext: 'Aktuális kontextus bezárása',
  colNum: '#',
  colThumb: 'Miniatűr',
  colFilename: 'Fájlnév',
  colTime: 'Idő',
  colName: 'Név',
  colCrop: 'Vágás',
  colBox: 'Box',
  colShift: 'Eltolás',
  colPreset: 'Előbeállítás',
  colLabel: 'Címke',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxelek',
  colSegment: 'Szegmens',
  colQuantity: 'Mennyiség',
  colValue: 'Érték',
  colUnits: 'Egységek',
  noReportSelected: 'Nincs kiválasztott jelentés',
  noSnapshots: 'Nincs pillanatkép',
  noSegmentations:
    'Még nincs szegmentáció az Image Display-ről. Frissítsen a SEG-katalógus betöltéséhez.',
  noMeasurements:
    'Még nincs mérés. Használja a + jelet egy szegmentációnál a hozzáadáshoz, vagy fogadjon TID1500 SR-t.',
  refreshFromImageDisplay: 'Frissítés az Image Display-ről',
  notConnectedToHub: 'Nincs kapcsolat a Hub hubbal',
  worklistNoOpenStudy: 'A munkalista nyitott vizsgálat nélkül válaszolt',
};

const lt: ReportingChrome = {
  viewers: 'Peržiūros priemonės:',
  worklistLabel: 'Darbų sąrašas:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Momentinės nuotraukos',
  volumes: 'Tūriai',
  segmentations: 'Segmentacijos',
  measurements: 'Matavimai',
  currentContext: 'Dabartinis kontekstas:',
  none: 'nėra',
  close: 'Uždaryti',
  closeContext: 'Uždaryti dabartinį kontekstą',
  colNum: '#',
  colThumb: 'Miniatiūra',
  colFilename: 'Failo pavadinimas',
  colTime: 'Laikas',
  colName: 'Pavadinimas',
  colCrop: 'Apkirpimas',
  colBox: 'Box',
  colShift: 'Poslinkis',
  colPreset: 'Išankstinė nuostata',
  colLabel: 'Etiketė',
  colSnomed: 'SNOMED',
  colVoxels: 'Vokseliai',
  colSegment: 'Segmentas',
  colQuantity: 'Dydis',
  colValue: 'Reikšmė',
  colUnits: 'Vienetai',
  noReportSelected: 'Nepasirinkta ataskaita',
  noSnapshots: 'Nėra momentinių nuotraukų',
  noSegmentations:
    'Dar nėra segmentacijų iš Image Display. Atnaujinkite, kad įkeltumėte SEG katalogą.',
  noMeasurements:
    'Dar nėra matavimų. Naudokite + prie segmentacijos, kad pridėtumėte, arba gaukite TID1500 SR.',
  refreshFromImageDisplay: 'Atnaujinti iš Image Display',
  notConnectedToHub: 'Nėra ryšio su Slicer hub',
  worklistNoOpenStudy: 'Darbų sąrašas atsakė be atviro tyrimo',
};

const ro: ReportingChrome = {
  viewers: 'Vizualizatoare:',
  worklistLabel: 'Listă de lucru:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Capturi',
  volumes: 'Volume',
  segmentations: 'Segmentări',
  measurements: 'Măsurători',
  currentContext: 'Context actual:',
  none: 'niciunul',
  close: 'Închide',
  closeContext: 'Închide contextul actual',
  colNum: '#',
  colThumb: 'Miniatură',
  colFilename: 'Nume fișier',
  colTime: 'Oră',
  colName: 'Nume',
  colCrop: 'Decupare',
  colBox: 'Box',
  colShift: 'Deplasare',
  colPreset: 'Presetare',
  colLabel: 'Etichetă',
  colSnomed: 'SNOMED',
  colVoxels: 'Voxel',
  colSegment: 'Segment',
  colQuantity: 'Cantitate',
  colValue: 'Valoare',
  colUnits: 'Unități',
  noReportSelected: 'Niciun raport selectat',
  noSnapshots: 'Nicio captură',
  noSegmentations:
    'Încă nu există segmentări din Image Display. Reîmprospătați pentru a încărca catalogul SEG.',
  noMeasurements:
    'Încă nu există măsurători. Folosiți + pe o segmentare pentru a adăuga una, sau primiți un SR TID1500.',
  refreshFromImageDisplay: 'Reîmprospătează din Image Display',
  notConnectedToHub: 'Neconectat la hub-ul Hub',
  worklistNoOpenStudy: 'Lista de lucru a răspuns fără studiu deschis',
};

const noRp: ReportingChrome = {
  viewers: 'Visningsprogrammer:',
  worklistLabel: 'Worklist:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'Øyeblikksbilder',
  volumes: 'Volumer',
  segmentations: 'Segmenteringer',
  measurements: 'Målinger',
  currentContext: 'Gjeldende kontekst:',
  none: 'ingen',
  close: 'Lukk',
  closeContext: 'Lukk gjeldende kontekst',
  colNum: '#',
  colThumb: 'Miniatyr',
  colFilename: 'Filnavn',
  colTime: 'Tid',
  colName: 'Navn',
  colCrop: 'Beskjæring',
  colBox: 'Box',
  colShift: 'Forskyvning',
  colPreset: 'Forhåndsinnstilling',
  colLabel: 'Etikett',
  colSnomed: 'SNOMED',
  colVoxels: 'Voksler',
  colSegment: 'Segment',
  colQuantity: 'Størrelse',
  colValue: 'Verdi',
  colUnits: 'Enheter',
  noReportSelected: 'Ingen rapport valgt',
  noSnapshots: 'Ingen øyeblikksbilder',
  noSegmentations:
    'Ingen segmenteringer fra Image Display ennå. Oppdater for å laste SEG-katalogen.',
  noMeasurements:
    'Ingen målinger ennå. Bruk + på en segmentering for å legge til, eller motta en TID1500-SR.',
  refreshFromImageDisplay: 'Oppdater fra Image Display',
  notConnectedToHub: 'Ikke tilkoblet Hub-huben',
  worklistNoOpenStudy: 'Worklisten svarte uten åpen studie',
};

const ar: ReportingChrome = {
  viewers: 'العارضات:',
  worklistLabel: 'قائمة العمل:',
  slicerWorklist: 'SlicerWorklist',
  snapshots: 'لقطات',
  volumes: 'الحجمات',
  segmentations: 'التجزئات',
  measurements: 'القياسات',
  currentContext: 'السياق الحالي:',
  none: 'لا شيء',
  close: 'إغلاق',
  closeContext: 'إغلاق السياق الحالي',
  colNum: '#',
  colThumb: 'مصغّر',
  colFilename: 'اسم الملف',
  colTime: 'الوقت',
  colName: 'الاسم',
  colCrop: 'قص',
  colBox: 'مربع',
  colShift: 'إزاحة',
  colPreset: 'إعداد مسبق',
  colLabel: 'التسمية',
  colSnomed: 'SNOMED',
  colVoxels: 'فوكسلات',
  colSegment: 'مقطع',
  colQuantity: 'الكمية',
  colValue: 'القيمة',
  colUnits: 'الوحدات',
  noReportSelected: 'لم يتم اختيار تقرير',
  noSnapshots: 'لا لقطات',
  noSegmentations:
    'لا تجزئات من Image Display بعد. حدّث لتحميل كتالوج SEG.',
  noMeasurements:
    'لا قياسات بعد. استخدم + على تجزئة لإضافة قياس، أو استلم TID1500 SR.',
  refreshFromImageDisplay: 'تحديث من Image Display',
  notConnectedToHub: 'غير متصل بمركز Hub',
  worklistNoOpenStudy: 'استجابت قائمة العمل بدون دراسة مفتوحة',
};

export const REPORTING_BY_LOCALE: Record<AppLocale, ReportingChrome> = {
  en,
  ar,
  fr,
  es,
  ca,
  de,
  it,
  pt,
  ko,
  pl,
  uk,
  cs,
  nl,
  el,
  lv,
  hu,
  lt,
  ro,
  no: noRp,
};

export function reportingChromeFor(locale?: AppLocale): ReportingChrome {
  const code = locale || resolveStoredLocale();
  return { ...REPORTING_BY_LOCALE[code] };
}

/** Apply [data-i18n-rp="key"] text/title/aria from ReportingChrome. */
export function applyReportingChrome(
  root: ParentNode = document,
  locale?: AppLocale
): void {
  const h = reportingChromeFor(locale);
  root.querySelectorAll<HTMLElement>('[data-i18n-rp]').forEach((el) => {
    const key = el.getAttribute('data-i18n-rp') as keyof ReportingChrome | null;
    if (!key || !(key in h)) return;
    el.textContent = h[key];
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-rp-title]').forEach((el) => {
    const key = el.getAttribute(
      'data-i18n-rp-title'
    ) as keyof ReportingChrome | null;
    if (!key || !(key in h)) return;
    el.title = h[key];
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-rp-aria]').forEach((el) => {
    const key = el.getAttribute(
      'data-i18n-rp-aria'
    ) as keyof ReportingChrome | null;
    if (!key || !(key in h)) return;
    el.setAttribute('aria-label', h[key]);
  });
}
